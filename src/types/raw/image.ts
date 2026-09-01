import type { ImageUploadSlot } from "../image";

export interface RawImageUploadSlot {
  put_url: string;
  image_version: number;
  headers: Record<string, string>;
}

export interface RawAllocImageResult { slot: RawImageUploadSlot | null }

export function unwrapRawImageUploadSlot(raw: RawImageUploadSlot): ImageUploadSlot {
  return {
    putUrl: raw.put_url,
    imageVersion: raw.image_version,
    headers: raw.headers,
  };
}
