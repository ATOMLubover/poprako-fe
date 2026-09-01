import type { RawTeamInfo } from "./team";

export interface RawWorksetInfo {
  id: string;

  team_id: string;
  team?: RawTeamInfo | undefined;

  index: number;
  comic_count: number;

  name: string;
  description: string;

  created_at: number;
  updated_at: number;
}
