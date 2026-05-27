import type { IStorage } from './storage.interface';
import { R2StorageAdapter } from './r2.adapter';

let instance: IStorage | null = null;

/**
 * Storage provider factory.
 * Returns the active IStorage implementation (currently Cloudflare R2).
 */
export function getStorage(): IStorage {
  if (!instance) instance = new R2StorageAdapter();
  return instance;
}
