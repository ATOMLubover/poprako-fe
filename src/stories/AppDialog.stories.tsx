import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import AppDialog, { AppDialogAction } from "@/components/ui/AppDialog";

const meta: Meta<typeof AppDialog> = {
  title: "UI/AppDialog",
  component: AppDialog,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: {
    title: "编辑内容",
    description: "统一的标题、说明和操作区域",
    onClose: fn(),
    children: (
      <div className="space-y-2.5">
        <input
          aria-label="名称"
          placeholder="名称"
          className={[
            "h-8 w-full rounded-md border border-slate-200 px-3 text-sm",
            "shadow-sm shadow-slate-100 outline-none focus:border-slate-300",
          ].join(" ")}
        />
        <textarea
          aria-label="描述"
          placeholder="描述（选填）"
          rows={3}
          className={[
            "w-full resize-none rounded-md border border-slate-200 px-3 py-2",
            "text-sm shadow-sm shadow-slate-100 outline-none",
            "focus:border-slate-300",
          ].join(" ")}
        />
      </div>
    ),
    footer: (
      <div className="flex gap-2">
        <AppDialogAction>取消</AppDialogAction>
        <AppDialogAction tone="brand">保存</AppDialogAction>
      </div>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof AppDialog>;

export const Default: Story = {};

export const Warning: Story = {
  args: {
    title: "删除术语库",
    description: "删除后，其中全部术语也会一并删除。",
    tone: "warning",
    size: "compact",
    children: (
      <div className="rounded-md border border-red-100 bg-red-50/60 px-3 py-2.5">
        <p className="text-sm font-semibold text-slate-700">角色称谓</p>
        <p className="mt-1 text-xs text-red-500">该操作无法撤销。</p>
      </div>
    ),
    footer: (
      <div className="flex gap-2">
        <AppDialogAction>返回</AppDialogAction>
        <AppDialogAction tone="danger">确认删除</AppDialogAction>
      </div>
    ),
  },
};

export const LongContent: Story = {
  args: {
    title: "可滚动内容",
    size: "large",
    children: (
      <div className="space-y-2">
        {Array.from({ length: 20 }, (_, index) => (
          <div
            key={index}
            className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
          >
            <p className="text-sm font-medium text-slate-600">
              内容项 {index + 1}
            </p>
          </div>
        ))}
      </div>
    ),
  },
};

export const Mobile390: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};
