import { NextResponse, type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { getImageProcessor } from '@/integrations/image/image.factory';
import { getStorage } from '@/integrations/storage/storage.factory';
import { toAppError } from '@/lib/errors/error-handler';
import { ForbiddenError, ValidationError } from '@/lib/errors/errors';
import { MAX_UPLOAD_BYTES } from '@/config/constants';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_SCOPES: ReadonlySet<string> = new Set(['item', 'logo']);

/**
 * POST /api/uploads/image
 * Multipart form: `file` (image), `scope` ("item" | "logo").
 * Validates magic bytes, resizes, transcodes to WebP, uploads to R2.
 * Returns the public WebP URL.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await requireOwnerRestaurant();
    const ip = await clientIp();
    await enforceRateLimit('public', `upload:${ip}:${ctx.userId}`);

    const form = await req.formData();
    const file = form.get('file');
    const scopeRaw = form.get('scope');
    if (!(file instanceof File)) throw new ValidationError('Missing file');
    const scope = typeof scopeRaw === 'string' ? scopeRaw : 'item';
    if (!ALLOWED_SCOPES.has(scope)) throw new ValidationError('Invalid scope');

    const bytes = new Uint8Array(await file.arrayBuffer());
    const processed = await getImageProcessor().process({
      body: bytes,
      declaredMime: file.type,
      maxBytes: MAX_UPLOAD_BYTES,
      maxDimension: 1600,
    });

    const key = `restaurants/${ctx.restaurantId}/${scope}/${crypto.randomUUID()}.webp`;
    const uploaded = await getStorage().upload({
      key,
      body: processed.webp,
      contentType: 'image/webp',
    });

    logger.info(
      { restaurantId: ctx.restaurantId, scope, width: processed.width, height: processed.height },
      'image uploaded',
    );

    return NextResponse.json({
      ok: true,
      url: uploaded.publicUrl,
      width: processed.width,
      height: processed.height,
    });
  } catch (err) {
    const e = toAppError(err);
    logger.warn({ code: e.code, message: e.message }, 'image upload failed');
    return NextResponse.json(
      { ok: false, code: e.code, message: e.message },
      { status: e.httpStatus },
    );
  }
}

/**
 * DELETE /api/uploads/image?url=<publicUrl>
 * Removes an uploaded image. The URL's key path must start with the caller's
 * own restaurant prefix — preventing one owner from deleting another's assets.
 * Used by the item modal to clean up orphan uploads on cancel / save failure.
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await requireOwnerRestaurant();
    const ip = await clientIp();
    await enforceRateLimit('public', `upload-del:${ip}:${ctx.userId}`);

    const url = req.nextUrl.searchParams.get('url');
    if (!url) throw new ValidationError('Missing url');

    const key = extractKey(url);
    const prefix = `restaurants/${ctx.restaurantId}/`;
    if (!key.startsWith(prefix)) throw new ForbiddenError('Not your asset');

    await getStorage().remove(key);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const e = toAppError(err);
    return NextResponse.json(
      { ok: false, code: e.code, message: e.message },
      { status: e.httpStatus },
    );
  }
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
}

/** Pull the storage key out of a public URL (everything after the host). */
function extractKey(publicUrl: string): string {
  try {
    const u = new URL(publicUrl);
    return u.pathname.replace(/^\/+/, '');
  } catch {
    throw new ValidationError('Invalid url');
  }
}
