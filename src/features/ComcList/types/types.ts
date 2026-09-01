import type { ChapterInfo, ComicInfo } from "@/types";

export interface ComicTranslationListItem {
  comicInfo: ComicInfo;
  chapter?: ChapterInfo | undefined;
}

export type TripleFilter = "pending" | "ongoing" | "completed" | "unset";

export type BinaryFilter = "pending" | "completed" | "unset";
