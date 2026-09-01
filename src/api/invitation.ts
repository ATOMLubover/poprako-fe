import { api } from "./util";
import type { Result } from "@/types/utils/result";
import type { InvitationInfo, CreateInvitationArgs } from "@/types/invitation";
import {
  unwrapRawInvitationInfo,
  type RawInvitationInfo,
} from "@/types/raw/invitation";

interface ListInvitationsArgs {
  teamId: string;
  offset: number;
  limit: number;
  includes?: ("invitor" | "invitee")[];
  isPending?: boolean;
}

export async function listInvitations(
  args: ListInvitationsArgs,
): Promise<Result<InvitationInfo[]>> {
  const result = await api.get<RawInvitationInfo[] | null>(
    `/teams/${args.teamId}/member-invitations`,
    {
      offset: args.offset,
      limit: args.limit,
      is_pending: args.isPending,
      incl: args.includes,
    },
  );

  if (!result.success) {return result;}

  return {
    success: true,
    data: result.data?.map((item) => unwrapRawInvitationInfo(item)) ?? [],
  };
}

interface RawCreateInvitationBody {
  team_id: string;
  invitee_qid: string;
  roles: number;
}

interface CreateInvitationRes {
  code: string;
}

export async function deleteInvitation(
  invitationId: string,
): Promise<Result<undefined>> {
  const result = await api.delete<undefined>(`/member-invitations/${invitationId}`);
  if (!result.success) {return result;}
  return { success: true, data: undefined };
}

export async function createInvitation(
  args: CreateInvitationArgs,
): Promise<Result<string>> {
  const body: RawCreateInvitationBody = {
    team_id: args.teamId,
    invitee_qid: args.inviteeQq,
    roles: args.roles,
  };

  const result = await api.post<CreateInvitationRes, RawCreateInvitationBody>(
    "/member-invitations",
    body,
  );

  if (!result.success) {return result;}

  return {
    success: true,
    data: result.data.code,
  };
}
