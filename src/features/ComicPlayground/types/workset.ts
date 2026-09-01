export interface ListWorksetArgs {
  teamId: string;
  offset: number;
  limit: number;
}

export interface RawListWorksetArgs {
  team_id: string;
  offset: number;
  limit: number;
}

export interface CreateWorksetArgs {
  teamId: string;
  name: string;
  description?: string | undefined;
}

export interface RawCreateWorksetArgs {
  team_id: string;
  name: string;
  description?: string | undefined;
}

export interface UpdateWorksetArgs {
  name: string;
  description?: string | undefined;
}

export interface RawUpdateWorksetArgs {
  id: string;
  name: string;
  description?: string | undefined;
}
