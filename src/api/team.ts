import { api } from "./util";
import type { Result } from "@/types/utils/result";
import type {
  AllocTeamAvatarResult,
  TeamInfo,
  UpdateTeamArgs,
} from "@/types/team";
import type { AllocImageArgs } from "@/types/image";
import {
  unwrapRawTeamInfo,
  unwrapRawAllocTeamAvatarResult,
  type RawTeamInfo,
  type RawAllocTeamAvatarResult,
} from "@/types/raw/team";
import { useAppStore } from "@/store/app";

type ListMyTeamsArgs = {
  offset: number;
  limit: number;
};

export async function listMyTeams(
  args: ListMyTeamsArgs,
): Promise<Result<TeamInfo[]>> {
  const userId = useAppStore.getState().loginState?.userInfo.id;
  if (!userId) return { success: false, error: "未找到当前用户" };

  const result = await api.get<RawTeamInfo[] | null>("/teams", {
    user_id: userId,
    offset: args.offset,
    limit: args.limit,
  });
  if (!result.success) return result;

  return {
    success: true,
    data: (result.data ?? []).map(unwrapRawTeamInfo),
  };
}

export async function markSelfOnline(teamId: string): Promise<Result<void>> {
  return api.put<void, Record<string, never>>(
    `/teams/${teamId}/mark-self-online`,
    {},
  );
}

export async function listOnlineUserIds(
  teamId: string,
): Promise<Result<string[]>> {
  return api.get<string[]>(`/teams/${teamId}/online-users`);
}

export async function allocTeamAvatarUpload(
  teamId: string,
  args: AllocImageArgs,
): Promise<Result<AllocTeamAvatarResult>> {
  const res = await api.post<
    RawAllocTeamAvatarResult,
    { image_hash: string; new_byte_len: number; ext: string }
  >(`/teams/${teamId}/avatar/alloc`, {
    image_hash: args.imageHash,
    new_byte_len: args.newByteLen,
    ext: args.extension,
  });
  if (!res.success) return res;

  return {
    success: true,
    data: unwrapRawAllocTeamAvatarResult(res.data),
  };
}

export async function confirmTeamAvatarUploaded(
  teamId: string,
  imageVersion: number,
): Promise<Result<void>> {
  const res = await api.post<void, { image_version: number }>(
    `/teams/${teamId}/avatar/mark-uploaded`,
    { image_version: imageVersion },
  );
  if (!res.success) return res;
  return { success: true, data: undefined };
}

export async function updateTeam(
  args: UpdateTeamArgs,
): Promise<Result<void>> {
  const res = await api.put<
    void,
    { id: string; name?: string; description?: string }
  >(
    `/teams/${args.id}`,
    {
      id: args.id,
      name: args.name,
      description: args.description,
    },
  );
  if (!res.success) return res;
  return { success: true, data: undefined };
}
