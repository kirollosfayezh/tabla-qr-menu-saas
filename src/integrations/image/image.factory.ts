import type { IImageProcessor } from './image.interface';
import { SharpImageProcessor } from './sharp.adapter';

let instance: IImageProcessor | null = null;

/** Returns the active image processor. Cached as a singleton. */
export function getImageProcessor(): IImageProcessor {
  if (!instance) instance = new SharpImageProcessor();
  return instance;
}
