import type { ReactNode } from "react";
import AppDialog from "@/components/ui/AppDialog";

interface Props {
  title: string;
  children: ReactNode;
  footer: ReactNode;
  locked: boolean;
  onClose: () => void;
}

export default function TerminologyDialogFrame({
  title,
  children,
  footer,
  locked,
  onClose,
}: Props) {
  return (
    <AppDialog
      title={title}
      footer={footer}
      locked={locked}
      onClose={onClose}
    >
      {children}
    </AppDialog>
  );
}
