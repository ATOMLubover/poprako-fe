export interface AssignmentInvitationInfo {
  id: string;
  chapterId: string;
  invitationCode: string;
  inviteeQq: string;
  inviterId: string;
  isPending: boolean;
  roles: number;
  createdAt: number;
  updatedAt: number;
}

export interface ListAssignmentInvitationsArgs {
  chapterId: string;
  isPending?: boolean;
  offset: number;
  limit: number;
}

export interface CreateAssignmentInvitationArgs {
  chapterId: string;
  inviteeQq: string;
  roles: number;
}

export interface CreateAssignmentInvitationResult {
  id: string;
  invitationCode: string;
}
