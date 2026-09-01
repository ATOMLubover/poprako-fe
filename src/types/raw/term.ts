import type { TermInfo } from "../term";

export interface RawTermInfo {
  id: string;
  termbase_id: string;

  source: string;
  targets: string[];
  comment?: string | null | undefined;

  creator_id: string;
  created_at: number;
  updated_at: number;
}

export function unwrapRawTermInfo(raw: RawTermInfo): TermInfo {
  return {
    id: raw.id,
    termbaseId: raw.termbase_id,
    source: raw.source,
    targets: raw.targets,
    comment: raw.comment ?? undefined,
    creatorId: raw.creator_id,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}
