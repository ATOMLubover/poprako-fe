import { useRef, useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import { LoaderCircle } from "lucide-react";
import type { ComicInfo } from "@/types";
import { useToastStore } from "@/components/ui/NotificationToast/hooks";
import { showLocalApiFailure, showLocalCaughtError } from "@/api/util";
import type { Result } from "@/types/utils/result";
import ComicProgressItem from "./ComicProgressItem";

interface Props {
  onLoadComics: (offset: number, limit: number) => Promise<Result<ComicInfo[]>>;
  onComicClick: (comicInfo: ComicInfo) => void;
}

export default function ComicProgressList({
  onLoadComics,
  onComicClick,
}: Props) {
  const pageSize = 20;
  const { showToast } = useToastStore();
  const [comics, setComics] = useState<ComicInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const offsetRef = useRef(0);

  const loadComics = useCallback(async (shouldReset = false) => {
    if (isLoadingRef.current) {return;}
    if (!shouldReset && !hasMoreRef.current) {return;}

    if (shouldReset) {
      hasMoreRef.current = true;
      offsetRef.current = 0;
      setComics([]);
      setHasMore(true);
    }

    const requestOffset = shouldReset ? 0 : offsetRef.current;

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const result = await onLoadComics(requestOffset, pageSize);
      if (!result.success) {
      // eslint-disable-next-line no-console
      console.error(
        "[ComicProgressList] 加载漫画列表失败:", result.error,
      );
        showLocalApiFailure(result, showToast);
        hasMoreRef.current = false;
        setHasMore(false);
        return;
      }

      const items = result.data;

      const nextOffset = requestOffset + items.length;
      const isNextHasMore = items.length === pageSize;

      offsetRef.current = nextOffset;
      hasMoreRef.current = isNextHasMore;
      setHasMore(isNextHasMore);
      setComics((prev) => (shouldReset ? items : [...prev, ...items]));
    } catch (error) {
      console.error("[ComicProgressList] 加载漫画列表异常:", error); // eslint-disable-line no-console
      showLocalCaughtError(error, showToast, "发生未知错误");
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [onLoadComics, pageSize, showToast]);

  const loadComicsRef = useRef(loadComics);
  useEffect(() => {
    loadComicsRef.current = loadComics;
  });

  useEffect(() => {
    isLoadingRef.current = false;
    const timerId = setTimeout(() => {
      void loadComics(true);
    }, 0);

    return () => {
      clearTimeout(timerId);
    };
  }, [loadComics]);

  // 每次加载完成后，检查 loadMoreRef 是否仍在可视区，处理竞态问题
  const prevIsLoadingRef = useRef(isLoading);
  useEffect(() => {
    const wasLoading = prevIsLoadingRef.current;
    prevIsLoadingRef.current = isLoading;

    if (!wasLoading || isLoading) {return;}
    if (!hasMoreRef.current) {return;}
    if (!loadMoreRef.current || !scrollContainerRef.current) {return;}

    const containerRect = scrollContainerRef.current.getBoundingClientRect();
    const targetRect = loadMoreRef.current.getBoundingClientRect();

    if (targetRect.top < containerRect.bottom) {
      void loadComicsRef.current();
    }
  }, [isLoading]);

  useEffect(() => {
    if (!loadMoreRef.current) {return;}

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry?.isIntersecting) {
          void loadComics();
        }
      },
      { root: scrollContainerRef.current },
    );
    observer.observe(loadMoreRef.current);
    return () => { observer.disconnect(); };
  }, [loadComics]);

  return (
    <div
      ref={scrollContainerRef}
      className="w-full h-full min-h-0 overflow-y-auto overflow-x-hidden"
    >
      <div
        className={clsx(
          "flex w-full flex-col gap-1.5 px-2 py-1",
        )}
      >
        {comics.map((comic) => (
          <ComicProgressItem
            key={comic.id}
            comicInfo={comic}
            mode="reviewer"
            onClick={() => { onComicClick(comic); }}
          />
        ))}
      </div>

      <div
        ref={loadMoreRef}
        className="w-full flex justify-center py-4 h-16 items-center"
      >
        {isLoading && (
          <LoaderCircle className="h-5 w-5 text-stone-300 animate-spin" />
        )}
        {!hasMore && comics.length > 0 && (
          <span className="text-slate-400 text-sm">没有更多漫画了 O^O</span>
        )}
        {!hasMore && comics.length === 0 && !isLoading && (
          <span className="text-slate-400 text-sm">暂无漫画</span>
        )}
      </div>
    </div>
  );
}
