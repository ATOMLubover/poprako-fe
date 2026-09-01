import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import PageList from "@/features/PageList/components/business/PageList";
import type { PageInfo } from "@/types/page";

const now = Date.now();

function makePages(count: number): PageInfo[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `page-${String(i + 1)}`,
    chapterId: "ch-1",
    index: i + 1,
    imageUrl: "",
    isUploaded: i < count - 2,
    totalUnitCount: 10 + (i % 5),
    translatedUnitCount: Math.min(
      10 + (i % 5),
      i % 3 === 0 ? 10 + (i % 5) : i * 2,
    ),
    proofreadUnitCount: i % 4 === 0 ? 8 : 0,
    creatorId: "user-0",
    createdAt: now,
    updatedAt: now,
  }));
}

const meta: Meta<typeof PageList> = {
  title: "Features/PageList",
  component: PageList,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PageList>;

export const Default: Story = {
  name: "默认（无操作）",
  args: {
    pages: makePages(12),
    onClickPage: () => { return; },
  },
};

export const WithDelete: Story = {
  name: "可删除（hover 显示垃圾桶）",
  args: {
    pages: makePages(12),
    onClickPage: () => { return; },
    enableDelete: true,
    onDeletePage: () => { return; },
  },
};

export const WithUpload: Story = {
  name: "可上传（拖放 Drop Area）",
  args: {
    pages: makePages(8),
    onClickPage: () => { return; },
    // eslint-disable-next-line @typescript-eslint/require-await
    onAddPages: async (files) => {
      void files;
    },
  },
};

export const Empty: Story = {
  name: "空列表（显示上传引导）",
  args: {
    pages: [],
    onClickPage: () => { return; },
    // eslint-disable-next-line @typescript-eslint/require-await
    onAddPages: async (files) => {
      void files;
    },
  },
};

export const WithDeleteAndUpload: Story = {
  name: "全功能（删除 + 上传）",
  args: {
    pages: makePages(10),
    onClickPage: () => { return; },
    enableDelete: true,
    onDeletePage: () => { return; },
    // eslint-disable-next-line @typescript-eslint/require-await
    onAddPages: async (files) => {
      void files;
    },
  },
};

const navigatePendingPage = fn();
const reuploadPendingPage = fn();

export const PendingUploadFailed: Story = {
  name: "待上传失败（不可导航、可重传）",
  args: {
    pages: makePages(1),
    onClickPage: navigatePendingPage,
    canReuploadPage: () => true,
    onReuploadPage: reuploadPendingPage,
    uploadStatusByPageId: {
      "page-1": "failed",
    },
    uploadErrorByPageId: {
      "page-1": "上传超时",
    },
  },
  play: async ({ canvasElement }) => {
    navigatePendingPage.mockClear();
    reuploadPendingPage.mockClear();

    const canvas = within(canvasElement);
    const pageBadge = canvas.getAllByText("P2")[0];
    if (!pageBadge) {throw new Error("页面标记缺失");}
    const pageCard = pageBadge.closest(String.raw`.aspect-3\/4`);
    await expect(pageCard).not.toBeNull();

    if (!pageCard) {return;}
    await userEvent.click(pageCard);
    await expect(navigatePendingPage).not.toHaveBeenCalled();

    const fileInput = canvasElement.querySelector<HTMLInputElement>(
      'input[type="file"]:not([multiple])',
    );
    await expect(fileInput).not.toBeNull();
    if (!fileInput) {return;}

    const replacement = new File(["replacement"], "replacement.png", {
      type: "image/png",
    });
    await userEvent.upload(fileInput, replacement);
    await expect(reuploadPendingPage).toHaveBeenCalledWith("page-1", replacement);
  },
};
