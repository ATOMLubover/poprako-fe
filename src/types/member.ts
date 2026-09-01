import type { TeamInfo } from "./team";
import type { UserInfo } from "./user";

export interface MemberInfo {
  id: string;

  userId: string;
  user?: UserInfo | undefined;

  teamId: string;
  team?: TeamInfo | undefined;

  assignedRawProviderAt?: number | undefined;
  assignedTranslatorAt?: number | undefined;
  assignedProofreaderAt?: number | undefined;
  assignedTypesetterAt?: number | undefined;
  assignedRedrawerAt?: number | undefined;
  assignedReviewerAt?: number | undefined;
  assignedPublisherAt?: number | undefined;
  assignedAdminAt?: number | undefined;

  roles: number;
  createdAt: number;
  updatedAt: number;
}
