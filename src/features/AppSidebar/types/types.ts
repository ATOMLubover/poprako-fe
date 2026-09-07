import type { LucideIcon } from "lucide-react";

export type NavId =
  | "workspace"
  | "comic-playground"
  | "member-list"
  | "system-mail"
  | "utilities"
  | "settings";

export interface NavConfig {
  id: NavId;
  path: string;
  label: string;
  icon: LucideIcon;
}

export interface TeamConfig {
  id: string;
  name: string;
  short: string;
  desc: string;
  avatarUrl: string;
  avatarThumbnailUrl?: string | undefined;
}
