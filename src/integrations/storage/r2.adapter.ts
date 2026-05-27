import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '@/config/env';
import { InternalServerError } from '@/lib/errors/errors';
import type { IStorage, UploadInput, UploadResult } from './storage.interface';

/**
 * Cloudflare R2 storage adapter implementing IStorage.
 * R2 speaks the S3 API, so we use the AWS S3 client pointed at the R2 endpoint.
 */
export class R2StorageAdapter implements IStorage {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor() {
    if (
      !env.R2_ACCOUNT_ID ||
      !env.R2_ACCESS_KEY_ID ||
      !env.R2_SECRET_ACCESS_KEY ||
      !env.R2_BUCKET ||
      !env.R2_PUBLIC_URL
    ) {
      throw new InternalServerError(
        'R2 storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL.',
      );
    }
    this.bucket = env.R2_BUCKET;
    this.publicBaseUrl = env.R2_PUBLIC_URL.replace(/\/$/, '');
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  /** Upload bytes to the bucket and return the public URL. */
  public async upload(input: UploadInput): Promise<UploadResult> {
    const body = await this.toUint8Array(input.body);
    const cacheSeconds = input.cacheSeconds ?? 31536000;

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: input.key,
          Body: body,
          ContentType: input.contentType,
          CacheControl: `public, max-age=${cacheSeconds}, immutable`,
        }),
      );
    } catch (err) {
      throw new InternalServerError(
        `R2 upload failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    return { key: input.key, publicUrl: this.publicUrl(input.key) };
  }

  /** Remove an object by key. */
  public async remove(key: string): Promise<void> {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (err) {
      throw new InternalServerError(
        `R2 delete failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  /** Build the public CDN URL for a stored key. */
  public publicUrl(key: string): string {
    return `${this.publicBaseUrl}/${key.replace(/^\/+/, '')}`;
  }

  private async toUint8Array(body: UploadInput['body']): Promise<Uint8Array> {
    if (body instanceof Uint8Array) return body;
    if (body instanceof ArrayBuffer) return new Uint8Array(body);
    if (body instanceof Blob) return new Uint8Array(await body.arrayBuffer());
    throw new InternalServerError('Unsupported upload body type');
  }
}
