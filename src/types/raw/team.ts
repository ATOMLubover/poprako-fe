import type {
  TeamInfo,
  CreateTeamArgs,
  CreateTeamResult,
  UpdateTeamArgs,
  AllocTeamAvatarResult,
} from "../team";
import { ensureHttpsUrl } from "@/utils/url";
import {
  unwrapRawImageUploadSlot,
  type RawAllocImageResult,
} from "./image";

export interface RawTeamInfo {
  id: string;
  name: string;
  description: string;
  avatar_url: string | null;
  avatar_thumbnail_url?: string | null | undefined;
  created_at: number;
  updated_at: number;
}

export function unwrapRawTeamInfo(raw: RawTeamInfo): TeamInfo {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    avatarUrl: ensureHttpsUrl(raw.avatar_url),
    avatarThumbnailUrl: ensureHttpsUrl(raw.avatar_thumbnail_url),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export interface RawCreateTeamArgs { name: string; description: string }
export function unwrapRawCreateTeamArgs(
  raw: RawCreateTeamArgs,
): CreateTeamArgs {
  return { name: raw.name, description: raw.description };
}

export interface RawCreateTeamResult { id: string }
export function unwrapRawCreateTeamResult(
  raw: RawCreateTeamResult,
): CreateTeamResult {
  return { id: raw.id };
}

export interface RawUpdateTeamArgs {
  id: string;
  name?: string | undefined;
  description?: string | undefined;
}
export function unwrapRawUpdateTeamArgs(
  raw: RawUpdateTeamArgs,
): UpdateTeamArgs {
  return { id: raw.id, name: raw.name, description: raw.description };
}

export type RawAllocTeamAvatarResult = RawAllocImageResult;
export function unwrapRawAllocTeamAvatarResult(
  raw: RawAllocTeamAvatarResult,
): AllocTeamAvatarResult {
  return raw.slot === null ? null : unwrapRawImageUploadSlot(raw.slot);
}
