export interface ImageUploadSlot {
  putUrl: string;
  imageVersion: number;
  headers: Record<string, string>;
}

export interface AllocImageArgs {
  imageHash: string;
  newByteLen: number;
  extension: string;
}
