export interface InvitationInfo {
  id: string;

  invitationCode: string;
  inviteeQq: string;
  invitorId: string;

  isPending: boolean;
  roles: number;

  createdAt: number;
}

export interface CreateInvitationArgs {
  teamId: string;
  inviteeQq: string;
  roles: number;
}
export interface UpdateInvitationArgs {
  id: string;
  roles?: number;
  teamId?: string;
}
