import type { UserInfo } from "./user";
import type { ImageUploadSlot } from "./image";

export type PageImageQuality = "optimized" | "original";

export interface Page {
  id: string;

  chapterId: string;
  index: number;

  imageUrl: string;
  imageOptimizedUrl?: string;
  imageThumbnailUrl?: string;
  isUploaded: boolean;
  imageHash?: string;
  newByteLen?: number;
  extension?: string;

  creatorId: string;
  creator?: UserInfo;

  totalUnitCount: number;
  translatedUnitCount: number;
  proofreadUnitCount: number;

  createdAt: number;
  updatedAt: number;
}

export type PageInfo = Page & {
  chapterId: string;
  imageUrl: string;
  createdAt: number;
  updatedAt: number;
};

export interface PageImageInput {
  pageId?: string;
  imageHash: string;
  newByteLen?: number;
  extension: string;
}

export type PageImageUpload = ImageUploadSlot;

export interface AllocatedPage {
  pageId: string;
  index: number;
  imageHash: string;
  extension: string;
  slot: PageImageUpload | null;
}

export interface AllocChapterPagesArgs {
  chapterId: string;
  pages: PageImageInput[];
}
export interface AllocChapterPagesResult { pages: AllocatedPage[] }

export interface PendingPage { pageId: string; index: number; fileIndex: number }

export interface UploadProgressCallbacks {
  onPagesAllocated: (pendingPages: PendingPage[]) => void;
  onPageUploaded: (pageId: string, file: File) => void;
  onPageUploadProgress?: (pageId: string, percent: number) => void;
}
