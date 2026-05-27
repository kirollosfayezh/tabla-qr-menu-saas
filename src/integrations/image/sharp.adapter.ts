import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import { ValidationError } from '@/lib/errors/errors';
import type { IImageProcessor, ProcessImageInput, ProcessedImage } from './image.interface';

/** MIMEs we accept as menu item / logo uploads. */
const ALLOWED_MIME: ReadonlySet<string> = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

/** Server-side image processor backed by libvips via `sharp`. */
export class SharpImageProcessor implements IImageProcessor {
  public async process(input: ProcessImageInput): Promise<ProcessedImage> {
    this.assertSize(input);
    await this.assertMime(input);

    const max = input.maxDimension ?? 1600;
    const pipeline = sharp(input.body, { failOn: 'error' })
      .rotate()
      .resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true });

    const [webp, meta] = await Promise.all([
      pipeline.clone().webp({ quality: 82 }).toBuffer(),
      pipeline.clone().metadata(),
    ]);

    return {
      webp: new Uint8Array(webp),
      width: meta.width ?? 0,
      height: meta.height ?? 0,
    };
  }

  private assertSize(input: ProcessImageInput): void {
    if (input.body.byteLength > input.maxBytes) {
      throw new ValidationError('File too large', {
        maxBytes: input.maxBytes,
        actualBytes: input.body.byteLength,
      });
    }
    if (input.body.byteLength === 0) {
      throw new ValidationError('Empty file');
    }
  }

  /** Validate both the declared MIME and the magic bytes. They must agree and be allowlisted. */
  private async assertMime(input: ProcessImageInput): Promise<void> {
    if (!ALLOWED_MIME.has(input.declaredMime)) {
      throw new ValidationError('Unsupported image type', { mime: input.declaredMime });
    }
    const sniffed = await fileTypeFromBuffer(input.body);
    if (!sniffed || !ALLOWED_MIME.has(sniffed.mime)) {
      throw new ValidationError('File does not look like an image');
    }
    if (sniffed.mime !== input.declaredMime) {
      throw new ValidationError('Image type mismatch', {
        declared: input.declaredMime,
        actual: sniffed.mime,
      });
    }
  }
}
