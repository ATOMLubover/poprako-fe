import { useCallback, useEffect, useRef, useState } from "react";
import { showLocalApiFailure, showLocalCaughtError } from "@/api/util";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { ToastType } from "@/components/ui/NotificationToast";
import type { ChapterInfo, ComicInfo } from "@/types";
import type { Result } from "@/types/utils/result";

type ShowToast = (message: string, type: ToastType) => void;

interface Args {
  returnTo: string;
  logPrefix: string;
  showToast: ShowToast;
  restoreComic: (comicId: string) => Promise<Result<ComicInfo>>;
}

export function useComicDetailHost({
  returnTo,
  logPrefix,
  showToast,
  restoreComic,
}: Args) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedComic, setSelectedComic] = useState<ComicInfo | null>(null);
  const userClosedRef = useRef(false);

  const urlComicId = searchParams.get("comicId");
  const urlChapterId = searchParams.get("chapterId");

  const selectedComicPinnedChapter: ChapterInfo | null =
    selectedComic?.pinnedChapter ?? null;

  const setComicDetailSearchParams = useCallback(
    (comicId: string | null, chapterId: string | null) => {
      const next = new URLSearchParams(searchParams);

      if (comicId) {
        next.set("comicId", comicId);
      } else {
        next.delete("comicId");
      }

      if (comicId && chapterId) {
        next.set("chapterId", chapterId);
      } else {
        next.delete("chapterId");
      }

      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const openComicDetail = useCallback(
    (comicInfo: ComicInfo, desiredChapterId?: string | null) => {
      setSelectedComic(comicInfo);
      setComicDetailSearchParams(
        comicInfo.id,
        desiredChapterId ?? comicInfo.pinnedChapter?.id ?? null,
      );
    },
    [setComicDetailSearchParams],
  );

  const clearComicDetail = useCallback(
    (isUserClosed = false) => {
      userClosedRef.current = isUserClosed;
      setSelectedComic(null);
      setComicDetailSearchParams(null, null);
    },
    [setComicDetailSearchParams],
  );

  useEffect(() => {
    if (!urlComicId || selectedComic?.id === urlComicId || userClosedRef.current) {
      userClosedRef.current = false;
      return;
    }

    let isCancelled = false;

    const restoreSelectedComic = async () => {
      try {
        const result = await restoreComic(urlComicId);
        if (!result.success) {
          showLocalApiFailure(result, showToast);
          if (!isCancelled) {
            setComicDetailSearchParams(null, null);
          }
          return;
        }

        if (!isCancelled) {
          openComicDetail(result.data, urlChapterId);
        }
      } catch (error) {
        console.error(`[${logPrefix}] 恢复漫画详情失败:`, error); // eslint-disable-line no-console
        showLocalCaughtError(error, showToast, "恢复漫画详情失败");
        if (!isCancelled) {
          setComicDetailSearchParams(null, null);
        }
      }
    };
    void restoreSelectedComic();

    return () => {
      isCancelled = true;
    };
  }, [
    logPrefix,
    openComicDetail,
    restoreComic,
    selectedComic?.id,
    setComicDetailSearchParams,
    showToast,
    urlChapterId,
    urlComicId,
  ]);

  /* eslint-disable react-hooks/preserve-manual-memoization */
  const navigateToTranslator = useCallback(
    (chapterId: string, pageId: string, isReadOnly?: boolean) => {
      if (!selectedComic?.id) {
        void navigate(`/translator/${chapterId}/${pageId}`);
        return;
      }

      const nextSearchParams = new URLSearchParams({
        returnTo,
        comicId: selectedComic.id,
        chapterId,
      });

      if (isReadOnly) {
        nextSearchParams.set("readOnly", "true");
      }

      void navigate({
        pathname: `/translator/${chapterId}/${pageId}`,
        search: `?${nextSearchParams.toString()}`,
      });
    },
    [navigate, returnTo, selectedComic?.id],
  );
  /* eslint-enable react-hooks/preserve-manual-memoization */

  return {
    selectedComic,
    selectedComicPinnedChapter,
    urlChapterId,
    openComicDetail,
    clearComicDetail,
    navigateToTranslator,
  };
}
