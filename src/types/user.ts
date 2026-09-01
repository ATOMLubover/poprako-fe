import type { ImageUploadSlot } from "./image";

export interface UserInfo {
  id: string;

  qq: string;
  name: string;

  avatarUrl: string;
  avatarThumbnailUrl?: string | undefined;

  isSuperAdmin: boolean;

  lastActiveAt: number;
  createdAt: number;
  updatedAt: number;
}

export type AllocUserAvatarResult = ImageUploadSlot | null;
