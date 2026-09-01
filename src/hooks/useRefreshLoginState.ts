import { useCallback } from "react";
import { listMyMembers } from "@/api/member";
import { getMyUser } from "@/api/user";
import { useAppStore } from "@/store/app";
import type { Result } from "@/types/utils/result";

export function useRefreshLoginState() {
  const setLoginState = useAppStore((s) => s.setLoginState);

  return useCallback(async (): Promise<Result<void>> => {
    try {
      const userInfo = await getMyUser();
      const memberInfos = await listMyMembers({ ownerId: userInfo.id });

      setLoginState({ userInfo, memberInfos });
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "刷新登录状态失败",
      };
    }
  }, [setLoginState]);
}
