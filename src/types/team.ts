import type { RawTeamInfo } from "./raw/team";
import type { ImageUploadSlot } from "./image";
import { ensureHttpsUrl } from "@/utils/url";

export interface TeamInfo {
  id: string;

  name: string;
  description: string;

  avatarUrl: string;
  avatarThumbnailUrl?: string | undefined;

  createdAt: number;
  updatedAt: number;
}

export function toTeamInfo(raw?: RawTeamInfo) {
  if (!raw) {return;}

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    avatarUrl: ensureHttpsUrl(raw.avatar_url),
    avatarThumbnailUrl: ensureHttpsUrl(raw.avatar_thumbnail_url),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  } as TeamInfo;
}

export interface CreateTeamArgs { name: string; description: string }
export interface CreateTeamResult { id: string }

export interface UpdateTeamArgs {
  id: string;
  name?: string | undefined;
  description?: string | undefined;
}

export type AllocTeamAvatarResult = ImageUploadSlot | null;

export function teamAvatarUrl(team: TeamInfo) {
  if (team.avatarThumbnailUrl) {
    return team.avatarThumbnailUrl;
  }
  if (team.avatarUrl) {
    return team.avatarUrl;
  }
  return null;
}
