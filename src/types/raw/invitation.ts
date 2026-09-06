import type {
  InvitationInfo,
  CreateInvitationArgs,
  UpdateInvitationArgs,
} from "../invitation";

export interface RawInvitationInfo {
  id: string;
  code: string;
  invitee_qid: string;
  invitor_id: string;
  is_pending: boolean;
  roles: number;
  team_id: string;
}

export function unwrapRawInvitationInfo(
  raw: RawInvitationInfo,
): InvitationInfo {
  return {
    id: raw.id,
    invitationCode: raw.code,
    inviteeQq: raw.invitee_qid,
    invitorId: raw.invitor_id,
    isPending: raw.is_pending,
    roles: raw.roles,
    createdAt: 0,
  };
}

export interface RawCreateInvitationArgs {
  invitee_qid: string;
  roles: number;
  team_id: string;
}
export function unwrapRawCreateInvitationArgs(
  raw: RawCreateInvitationArgs,
): CreateInvitationArgs {
  return {
    teamId: raw.team_id,
    inviteeQq: raw.invitee_qid,
    roles: raw.roles,
  };
}

export interface RawUpdateInvitationArgs {
  id: string;
  roles?: number | undefined;
}
export function unwrapRawUpdateInvitationArgs(
  raw: RawUpdateInvitationArgs,
): UpdateInvitationArgs {
  return {
    id: raw.id,
    roles: raw.roles,
  };
}
