import type { RawComicInfo } from "./raw/comic";
import { unwrapRawUserInfo, type RawUserInfo } from "./raw/user";
import type { UserInfo } from "./user";
import { toWorksetInfo, type WorksetInfo } from "./workset";
import type { ChapterInfo } from "./chapter";
import type { AssignmentInfo } from "./assignment";
import { ensureHttpsUrl } from "@/utils/url";

export interface ComicInfo {
  id: string;

  worksetId: string;
  workset?: WorksetInfo | undefined;

  index: number;
  chapterCount: number;

  title: string;
  author: string;
  description: string;

  coverUrl: string;
  coverThumbnailUrl?: string | undefined;
  isCoverUploaded: boolean;

  creatorId: string;
  creator?: UserInfo | undefined;

  pinnedChapter?: ChapterInfo | undefined;
  pinnedChapterAssignments?: AssignmentInfo[] | undefined;

  lastActiveAt: number;

  createdAt: number;
  updatedAt: number;
}

export function toComicInfo(raw?: RawComicInfo) {
  if (!raw) {return;}

  return {
    id: raw.id,

    worksetId: raw.workset_id,
    workset: toWorksetInfo(raw.workset),

    index: raw.index,
    chapterCount: raw.chapter_count,

    title: raw.title,
    author: raw.author,
    description: raw.description ?? "",

    coverUrl: ensureHttpsUrl(raw.cover_url),
    coverThumbnailUrl: ensureHttpsUrl(raw.cover_thumbnail_url),
    isCoverUploaded: Boolean(raw.cover_url),

    creatorId: raw.creator_id,
    creator: toUserInfo(raw.creator),

    lastActiveAt: raw.last_active_at,

    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  } as ComicInfo;
}

export interface CreateComicArgs {
  worksetId: string;
  title: string;
  author: string;
  description?: string | undefined;
  firstChapterTitle?: string | undefined;
}

export interface CreateComicResult { id: string }

export interface UpdateComicArgs {
  id: string;
  title?: string | undefined;
  author?: string | undefined;
  description?: string | undefined;
}
function toUserInfo(creator: RawUserInfo | undefined): UserInfo | undefined {
  return creator ? unwrapRawUserInfo(creator) : undefined;
}
