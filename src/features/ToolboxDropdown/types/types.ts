import type { ReactNode } from "react";

export interface ToolboxOption {
  icon: ReactNode;
  title: string;
  onClick: () => Promise<void> | void;
}
