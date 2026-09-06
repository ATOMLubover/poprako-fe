import { api } from "@/api/util";
import { toWorksetInfo } from "@/types/workset";
import type { WorksetInfo } from "@/types/workset";
import type { Result } from "@/types/utils/result";
import type { RawWorksetInfo } from "@/types/raw/workset";
import type {
  ListWorksetArgs,
  RawListWorksetArgs,
  CreateWorksetArgs,
  RawCreateWorksetArgs,
  UpdateWorksetArgs,
  RawUpdateWorksetArgs,
} from "../types/workset";

export async function listWorksets(
  args: ListWorksetArgs,
): Promise<Result<WorksetInfo[]>> {
  const rawArgs: Omit<RawListWorksetArgs, "team_id"> = {
    offset: args.offset,
    limit: args.limit,
  };

  const res = await api.get<RawWorksetInfo[]>(
    `/teams/${args.teamId}/worksets`,
    rawArgs,
  );
  if (!res.success) {return res;}

  const items = Array.isArray(res.data) ? res.data : [];
  return { success: true, data: items.flatMap((raw) => {
    const workset = toWorksetInfo(raw);
    return workset ? [workset] : [];
  }) };
}

export async function createWorkset(
  args: CreateWorksetArgs,
): Promise<Result<string>> {
  const rawArgs: RawCreateWorksetArgs = {
    team_id: args.teamId,
    name: args.name,
    description: args.description,
  };

  const res = await api.post<{ id: string }, RawCreateWorksetArgs>(
    "/worksets",
    rawArgs,
  );
  if (!res.success) {return res;}
  return { success: true, data: (res.data).id };
}

export async function updateWorkset(
  id: string,
  args: UpdateWorksetArgs,
): Promise<Result<undefined>> {
  const rawArgs: RawUpdateWorksetArgs = {
    id,
    name: args.name,
    description: args.description,
  };

  const res = await api.put<undefined, RawUpdateWorksetArgs>(
    `/worksets/${id}`,
    rawArgs,
  );
  if (!res.success) {return res;}
  return { success: true, data: undefined };
}

export async function deleteWorkset(id: string): Promise<Result<undefined>> {
  const res = await api.delete<undefined>(`/worksets/${id}`);
  if (!res.success) {return res;}
  return { success: true, data: undefined };
}
