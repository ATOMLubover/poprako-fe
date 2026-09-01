import type { RawWorksetInfo } from "./raw/workset";
import { toTeamInfo, type TeamInfo } from "./team";

export interface WorksetInfo {
  id: string;

  teamId: string;
  team?: TeamInfo | undefined;

  index: number;
  name: string;
  description: string;
  comicCount: number;

  createdAt: number;
  updatedAt: number;
}

export function toWorksetInfo(raw?: RawWorksetInfo) {
  if (!raw) {return;}

  return {
    id: raw.id,
    teamId: raw.team_id,
    team: toTeamInfo(raw.team),
    index: raw.index,
    name: raw.name,
    description: raw.description,
    comicCount: raw.comic_count,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  } as WorksetInfo;
}
