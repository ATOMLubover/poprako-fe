import { useRef, useState, useEffect, useCallback } from "react";
import { LoaderCircle } from "lucide-react";
import type { MemberInfo } from "@/types/member";
import MemberCard from "@/features/MemberCard/components/business/MemberCard";
import { useToastStore } from "@/components/ui/NotificationToast/hooks";
import { showLocalApiFailure, showLocalCaughtError } from "@/api/util";
import type { Result } from "@/types/utils/result";

interface Props {
  onLoadMembers: (
    offset: number,
    limit: number,
  ) => Promise<Result<MemberInfo[]>>;
  onMemberClick?: ((member: MemberInfo) => void) | undefined;
}

// 受控的成员列表展示组件，负责无限下滑加载
// 过滤/搜索逻辑由父组件通过 onLoadMembers 闭包注入
export default function EmbeddedMemberList({
  onLoadMembers,
  onMemberClick,
}: Props) {
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const { showToast } = useToastStore();

  const loadMembers = useCallback(async () => {
    if (isLoading || !hasMore) {return;}
    setIsLoading(true);
    try {
      const result = await onLoadMembers(offset, 20);
      if (result.success) {
        if (result.data.length < 20) {setHasMore(false);}
        setMembers((prev) => [...prev, ...result.data]);
        setOffset((prev) => prev + result.data.length);
      } else {
        // eslint-disable-next-line no-console
        console.error(
          "[EmbeddedMemberList] 加载成员列表失败:", result.error,
        );
        showLocalApiFailure(result, showToast);
        setHasMore(false);
      }
    } catch (error) {
      console.error("[EmbeddedMemberList] 加载成员列表异常:", error); // eslint-disable-line no-console
      showLocalCaughtError(error, showToast, "发生未知错误");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, offset, onLoadMembers, showToast]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect, @eslint-react/set-state-in-effect */
    setMembers([]);
    setHasMore(true);
    setOffset(0);
    setIsLoading(false);
    /* eslint-enable react-hooks/set-state-in-effect, @eslint-react/set-state-in-effect */
  }, [onLoadMembers]);

  useEffect(() => {
    if (!loadMoreRef.current) {return;}
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {void loadMembers();}
      },
      { root: scrollContainerRef.current },
    );
    observerRef.current.observe(loadMoreRef.current);
    return () => {
      if (observerRef.current) {observerRef.current.disconnect();}
    };
  }, [loadMembers]);

  return (
    <div
      ref={scrollContainerRef}
      className="w-full h-full min-h-0 overflow-y-auto py-4 px-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <MemberCard
            key={m.id}
            member={m}
            onClick={onMemberClick ? () => { onMemberClick(m); } : undefined}
          />
        ))}
      </div>

      {/* 无限滚动触发器 */}
      <div ref={loadMoreRef} className="flex justify-center py-6">
        {isLoading && (
          <LoaderCircle size={18} className="animate-spin text-slate-300" />
        )}
        {!isLoading && !hasMore && members.length > 0 && (
          <span className="text-sm text-slate-400">没有更多成员了 O^O</span>
        )}
        {!isLoading && !hasMore && members.length === 0 && (
          <span className="text-xs text-slate-400">暂无成员</span>
        )}
      </div>
    </div>
  );
}
