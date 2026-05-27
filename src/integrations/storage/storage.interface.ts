/** Provider-agnostic file storage interface. Swap providers via adapter. */
export interface IStorage {
  /** Upload bytes to the bucket. Returns the public URL of the stored object. */
  upload(input: UploadInput): Promise<UploadResult>;
  /** Delete an object by its key (path inside the bucket). */
  remove(key: string): Promise<void>;
  /** Build a public URL for an existing key (no I/O). */
  publicUrl(key: string): string;
}

export interface UploadInput {
  /** Storage key (path inside the bucket), e.g. `restaurants/<id>/logo.png`. */
  key: string;
  /** Raw file bytes. */
  body: ArrayBuffer | Uint8Array | Blob;
  /** MIME type, e.g. `image/png`. */
  contentType: string;
  /** Cache-Control max-age in seconds. Defaults to 1 year for immutable assets. */
  cacheSeconds?: number;
  /** Overwrite if the key already exists. Defaults to false. */
  upsert?: boolean;
}

export interface UploadResult {
  key: string;
  publicUrl: string;
}
