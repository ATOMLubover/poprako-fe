import type {
  PageInfo,
  AllocatedPage,
  AllocChapterPagesArgs,
  AllocChapterPagesResult,
} from "../page";
import { ensureHttpsUrl } from "@/utils/url";

export type RawPageInfo = {
  id: string;
  chapter_id: string;
  image_url: string | null;
  image_optimized_url?: string | null;
  image_thumbnail_url?: string | null;
  image_hash: string;
  ext: string;
  index: number;
  proofread_unit_count: number;
  total_unit_count: number;
  translated_unit_count: number;
  created_at: number;
  updated_at: number;
};

export function unwrapRawPageInfo(raw: RawPageInfo): PageInfo {
  return {
    id: raw.id,
    index: raw.index,
    totalUnitCount: raw.total_unit_count,
    translatedUnitCount: raw.translated_unit_count,
    proofreadUnitCount: raw.proofread_unit_count,
    chapterId: raw.chapter_id,
    imageUrl: ensureHttpsUrl(raw.image_url),
    imageOptimizedUrl: ensureHttpsUrl(raw.image_optimized_url),
    imageThumbnailUrl: ensureHttpsUrl(raw.image_thumbnail_url),
    isUploaded: !!raw.image_url,
    imageHash: raw.image_hash,
    extension: raw.ext,
    creatorId: "",
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  } as PageInfo;
}

export type RawAllocatedPage = {
  page_id: string;
  index: number;
  image_hash: string;
  ext: string;
  slot: {
    put_url: string;
    image_version: number;
    headers: Record<string, string>;
  } | null;
};
export function unwrapRawAllocatedPage(raw: RawAllocatedPage): AllocatedPage {
  return {
    pageId: raw.page_id,
    index: raw.index,
    imageHash: raw.image_hash,
    extension: raw.ext,
    slot: raw.slot === null ? null : {
      putUrl: raw.slot.put_url,
      imageVersion: raw.slot.image_version,
      headers: raw.slot.headers,
    },
  };
}

export type RawAllocChapterPagesArgs = {
  chapter_id: string;
  pages: Array<{
    page_id?: string;
    image_hash: string;
    new_byte_len?: number;
    ext: string;
  }>;
};
export function unwrapRawAllocChapterPagesArgs(
  raw: RawAllocChapterPagesArgs,
): AllocChapterPagesArgs {
  return {
    chapterId: raw.chapter_id,
    pages: raw.pages.map((page) => ({
      pageId: page.page_id,
      imageHash: page.image_hash,
      newByteLen: page.new_byte_len,
      extension: page.ext,
    })),
  };
}

export type RawAllocChapterPagesResult = {
  pages: RawAllocatedPage[];
};
export function unwrapRawAllocChapterPagesResult(
  raw: RawAllocChapterPagesResult,
): AllocChapterPagesResult {
  return {
    pages: raw.pages.map(unwrapRawAllocatedPage),
  };
}

export type RawDeleteChapterPagesArgs = { chapter_id: string };
export function wrapDeleteChapterPagesArgs(chapterId: string): RawDeleteChapterPagesArgs {
  return { chapter_id: chapterId };
}
