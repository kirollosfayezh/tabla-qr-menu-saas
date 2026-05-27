/** Provider-agnostic image processing interface. */
export interface IImageProcessor {
  /** Validate + resize + transcode an uploaded image. */
  process(input: ProcessImageInput): Promise<ProcessedImage>;
}

export interface ProcessImageInput {
  /** Raw uploaded bytes. */
  body: Uint8Array;
  /** Declared MIME type from the upload header (cross-checked against magic bytes). */
  declaredMime: string;
  /** Max width or height in pixels (image is fit inside this box). */
  maxDimension?: number;
  /** Hard byte cap for the input. */
  maxBytes: number;
}

export interface ProcessedImage {
  /** Processed output: WebP. WebP is supported by 97%+ of browsers in use today. */
  webp: Uint8Array;
  width: number;
  height: number;
}
