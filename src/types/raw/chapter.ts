import type {
  ChapterInfo,
  CreateChapterArgs,
  CreateChapterResult,
} from "../chapter";
import { unwrapRawComicInfo, type RawComicInfo } from "./comic";
import { unwrapRawUserInfo, type RawUserInfo } from "./user";

export interface RawChapterInfo {
  id: string;

  comic_id: string;
  comic?: RawComicInfo | undefined;

  creator_id: string;
  creator?: RawUserInfo | undefined;

  index: number;
  subtitle: string;

  page_count: number;
  total_unit_count: number;
  translated_unit_count: number;
  proofread_unit_count: number;
  is_pinned: boolean;
  stages: number;

  created_at: number;
  updated_at: number;
}

export function unwrapRawChapterDetail(raw: RawChapterInfo): ChapterInfo {
  return {
    id: raw.id,
    comicId: raw.comic_id,
    comic: raw.comic ? unwrapRawComicInfo(raw.comic) : undefined,
    creatorId: raw.creator_id,
    creator: raw.creator ? unwrapRawUserInfo(raw.creator) : undefined,
    index: raw.index,
    subtitle: raw.subtitle,
    isPinned: raw.is_pinned,
    stages: raw.stages,
    pageCount: raw.page_count,
    totalUnitCount: raw.total_unit_count,
    translatedUnitCount: raw.translated_unit_count,
    proofreadUnitCount: raw.proofread_unit_count,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  } as ChapterInfo;
}

export interface RawCreateChapterArgs {
  subtitle?: string | undefined;
  comic_id: string;
}
export function unwrapRawCreateChapterArgs(
  raw: RawCreateChapterArgs,
): CreateChapterArgs {
  return {
    comicId: raw.comic_id,
    subtitle: raw.subtitle,
  } as CreateChapterArgs;
}

export interface RawCreateChapterResult { id: string }
export function unwrapRawCreateChapterResult(
  raw: RawCreateChapterResult,
): CreateChapterResult {
  return { id: raw.id };
}
