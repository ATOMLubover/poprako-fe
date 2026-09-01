import type { UserInfo } from "./user";

export interface CommentInfo {
  id: string;
  teamId: string;
  userId: string;
  user?: UserInfo | undefined;
  content: string;
  createdAt: number;
}

export interface CommentCreatedResult {
  id: string;
}
