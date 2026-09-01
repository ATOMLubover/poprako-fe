import type {
  ComicInfo,
  CreateComicArgs,
  CreateComicResult,
  UpdateComicArgs,
} from "../comic";
import { toWorksetInfo } from "../workset";
import type { RawUserInfo } from "./user";
import type { RawWorksetInfo } from "./workset";
import type { RawAssignmentInfo } from "./assignment";
import type { RawChapterInfo } from "./chapter";
import { ensureHttpsUrl } from "@/utils/url";

export interface RawComicInfo {
  id: string;

  workset_id: string;
  workset?: RawWorksetInfo | undefined;

  title: string;
  author: string;
  description: string | null;
  index: number;
  chapter_count: number;

  cover_url: string | null;
  cover_thumbnail_url?: string | null | undefined;

  creator_id: string;
  creator?: RawUserInfo | undefined;

  last_active_at: number;
  created_at: number;
  updated_at: number;
}

export interface RawListComicInfosPayload {
  comics: RawComicInfo[];
  pinned_chapters: (RawChapterInfo | null)[];
  pinned_chapter_assignments: RawAssignmentInfo[][];
}

export function unwrapRawComicInfo(raw: RawComicInfo): ComicInfo {
  return {
    id: raw.id,
    worksetId: raw.workset_id,
    workset: toWorksetInfo(raw.workset),
    title: raw.title,
    author: raw.author,
    description: raw.description ?? "",
    isCoverUploaded: Boolean(raw.cover_url),
    creatorId: raw.creator_id,
    index: raw.index,
    chapterCount: raw.chapter_count,
    coverUrl: ensureHttpsUrl(raw.cover_url),
    coverThumbnailUrl: ensureHttpsUrl(raw.cover_thumbnail_url),
    lastActiveAt: raw.last_active_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  } as ComicInfo;
}

export interface RawCreateComicArgs {
  author: string;
  description: string;
  workset_id: string;
  title: string;
  first_chapter_subtitle?: string | undefined;
}
export function unwrapRawCreateComicArgs(
  raw: RawCreateComicArgs,
): CreateComicArgs {
  return {
    worksetId: raw.workset_id,
    title: raw.title,
    author: raw.author,
    description: raw.description,
    firstChapterTitle: raw.first_chapter_subtitle,
  } as CreateComicArgs;
}

export interface RawCreateComicResult { id: string }
export function unwrapRawCreateComicResult(
  raw: RawCreateComicResult,
): CreateComicResult {
  return { id: raw.id };
}

export interface RawUpdateComicArgs {
  id: string;
  title?: string | undefined;
  author?: string | undefined;
  description?: string | undefined;
}
export function unwrapRawUpdateComicArgs(
  raw: RawUpdateComicArgs,
): UpdateComicArgs {
  return {
    id: raw.id,
    title: raw.title,
    author: raw.author,
    description: raw.description,
  } as UpdateComicArgs;
}
