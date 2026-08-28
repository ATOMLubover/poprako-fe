import type { PageInfo } from "@/types";

type Args = {
  isCoverUploaded: boolean;
  comicCoverThumbnailUrl?: string | null;
  selectedChapterIndex?: number;
  pages: PageInfo[];
};

export function resolveComicDetailCoverUrl({
  isCoverUploaded,
  comicCoverThumbnailUrl,
  selectedChapterIndex,
  pages,
}: Args): string | null {
  if (isCoverUploaded || comicCoverThumbnailUrl) {
    return comicCoverThumbnailUrl ?? null;
  }

  if (selectedChapterIndex !== 0) return null;

  const firstPage = pages.find((page) => page.index === 0 && page.isUploaded);
  return firstPage?.imageThumbnailUrl || firstPage?.imageUrl || null;
}
