import type { UserInfo } from "./user";

export interface AnnouncementInfo {
  id: string;
  teamId: string;
  userId: string;
  user?: UserInfo | undefined;
  title: string;
  content: string;
  createdAt: number;
}
