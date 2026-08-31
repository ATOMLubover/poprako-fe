import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import StatusOptionBar from "@/features/BaseTranslator/components/business/StatusOptionBar";
import { DEFAULT_READ_ONLY_UNIT_VIEW } from
  "@/features/BaseTranslator/types/readOnlyUnitView";
import type { TranslatorMode } from "@/types/translatorMode";

const meta: Meta<typeof StatusOptionBar> = {
  title: "Features/StatusOptionBar",
  component: StatusOptionBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StatusOptionBar>;

function InteractiveWrapper({
  initialMode,
  availableModes,
}: {
  initialMode: TranslatorMode;
  availableModes: TranslatorMode[];
}) {
  const [view, setView] = useState<TranslatorMode>(initialMode);
  const [readOnlyUnitView, setReadOnlyUnitView] = useState(
    DEFAULT_READ_ONLY_UNIT_VIEW,
  );
  const [relocation, setRelocation] = useState(false);
  const [isHighResolution, setIsHighResolution] = useState(false);
  const [previewVisibility, setPreviewVisibility] = useState<
    "visible" | "dimmed"
  >("visible");

  function switchView() {
    setView((current) => {
      const currentIndex = availableModes.indexOf(current);
      const next = availableModes[(currentIndex + 1) % availableModes.length];
      if (next === "readOnly") {
        setReadOnlyUnitView(DEFAULT_READ_ONLY_UNIT_VIEW);
      }
      return next;
    });
  }

  const nextView = availableModes[
    (availableModes.indexOf(view) + 1) % availableModes.length
  ];

  return (
    <div className="w-64 border border-border rounded">
      <StatusOptionBar
        currMode={view}
        view={view}
        nextView={nextView}
        canSwitchView={availableModes.length > 1}
        readOnlyUnitView={readOnlyUnitView}
        isRelocationEnabled={relocation}
        isUnitCreationEnabled={true}
        proofreadPreviewVisibility={previewVisibility}
        isHighResolution={isHighResolution}
        isLoadingPage={false}
        onSwitchView={switchView}
        onSwitchReadOnlyUnitView={() =>
          setReadOnlyUnitView((current) =>
            current === "diff" ? "standard" : "diff",
          )
        }
        onRelocationClick={() => setRelocation((v) => !v)}
        onUnitCreationClick={() => console.log("unit creation toggled")}
        onToggleProofreadPreviewClick={() =>
          setPreviewVisibility((v) => (v === "visible" ? "dimmed" : "visible"))
        }
        onToggleImageQualityClick={async () =>
          setIsHighResolution((current) => !current)
        }
        onSaveClick={async () => console.log("saved")}
        saving={false}
      />
    </div>
  );
}

export const TranslateMode: Story = {
  name: "纯翻译（可切换只读模式）",
  render: () => (
    <InteractiveWrapper
      initialMode="translate"
      availableModes={["translate", "readOnly"]}
    />
  ),
};

export const ProofreadModeWithTranslationView: Story = {
  name: "校对模式（可查看翻译视图）",
  render: () => (
    <InteractiveWrapper
      initialMode="proofread"
      availableModes={["proofread", "translate"]}
    />
  ),
};

export const ProofreadMode: Story = {
  name: "校对模式（锁定校对视图）",
  render: () => (
    <InteractiveWrapper
      initialMode="proofread"
      availableModes={["proofread"]}
    />
  ),
};

export const ReadOnlyActive: Story = {
  name: "只读模式（编辑按钮隐藏）",
  render: () => (
    <InteractiveWrapper
      initialMode="readOnly"
      availableModes={["readOnly"]}
    />
  ),
};
