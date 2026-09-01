import type { UserInfo } from "./user";

export interface AnnouncementInfo {
  id: string;
  teamId: string;
  userId: string;
  user?: UserInfo;
  title: string;
  content: string;
  createdAt: number;
}
