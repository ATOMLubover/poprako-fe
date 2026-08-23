import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import UnitSearchTransformDialog from
  "@/features/BaseTranslator/features/UnitSearchTransform";
import type { UnitSearchMatch } from "@/features/BaseTranslator";
import type { Page } from "@/types/page";
import type { UnitInfo } from "@/types/unit";

const pages: Page[] = [0, 1, 2].map((index) => ({
  id: `page-${index + 1}`,
  chapterId: "chapter-1",
  index,
  imageUrl: "",
  isUploaded: true,
  creatorId: "user-1",
  totalUnitCount: 12,
  translatedUnitCount: 10,
  proofreadUnitCount: 8,
  createdAt: 0,
  updatedAt: 0,
}));

function makeMatch(index: number): UnitSearchMatch {
  const unit: UnitInfo = {
    id: `unit-${index + 1}`,
    index,
    xCoord: 0.2,
    yCoord: 0.3,
    isBubble: index % 2 === 0,
    isProofread: false,
    translatedText: index % 2 === 0
      ? "这是一段需要替换的旧词，旧词会被逐处标出。"
      : "另一条包含旧词的译文。",
  };

  return { pageId: `page-${(index % 3) + 1}`, unit };
}

const groupedMatches = Array.from({ length: 8 }, (_, index) => makeMatch(index));

const meta: Meta<typeof UnitSearchTransformDialog> = {
  title: "Features/BaseTranslator/UnitSearchTransformDialog",
  component: UnitSearchTransformDialog,
  parameters: { layout: "fullscreen" },
  args: {
    pages,
    part: "translatedText",
    currentPageId: "page-1",
    onBeforeSearch: fn(async () => undefined),
    onRefreshCurrentPage: fn(async () => undefined),
    onNavigate: fn(async () => undefined),
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof UnitSearchTransformDialog>;

export const GroupedResults: Story = {
  args: {
    dataSource: {
      search: async () => ({ success: true, data: groupedMatches }),
      transform: async () => ({ success: true, data: undefined }),
      reloadPage: async () => ({ success: true, data: [] }),
    },
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.type(page.getByRole("textbox", { name: "查找短语" }), "旧词");
    await userEvent.click(page.getByRole("button", { name: "搜索" }));
    expect(await page.findByText("8 个匹配 Unit")).toBeVisible();
    const pageSelector = page.getByRole("checkbox", {
      name: "选择第 1 页全部匹配项",
    });
    expect(pageSelector).toHaveAttribute("aria-checked", "true");
    await userEvent.click(page.getAllByRole("button", { name: "展开页面" })[0]);
    expect(page.getAllByText("旧词").length).toBeGreaterThan(0);
    expect(page.getByRole("textbox", { name: "替换短语" })).toBeEnabled();
    await userEvent.click(page.getAllByRole("checkbox", { name: "选择该 Unit" })[0]);
    expect(pageSelector).toHaveAttribute("aria-checked", "mixed");
    await userEvent.click(pageSelector);
    expect(pageSelector).toHaveAttribute("aria-checked", "true");
    await userEvent.click(pageSelector);
    expect(pageSelector).toHaveAttribute("aria-checked", "false");
  },
};

export const MoreThanOneHundred: Story = {
  args: {
    dataSource: {
      search: async () => ({
        success: true,
        data: Array.from({ length: 105 }, (_, index) => makeMatch(index)),
      }),
      transform: async () => ({ success: true, data: undefined }),
      reloadPage: async () => ({ success: true, data: [] }),
    },
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(page.getByRole("button", { name: "搜索" }));
    expect(await page.findByText("已选 100 · 上限 100")).toBeVisible();
  },
};

export const Empty: Story = {
  args: {
    dataSource: {
      search: async () => ({ success: true, data: [] }),
      transform: async () => ({ success: true, data: undefined }),
      reloadPage: async () => ({ success: true, data: [] }),
    },
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(page.getByRole("button", { name: "搜索" }));
    expect(await page.findByText("没有找到匹配内容")).toBeVisible();
  },
};

export const SearchError: Story = {
  args: {
    dataSource: {
      search: async () => ({ success: false, error: "搜索失败，请稍后重试" }),
      transform: async () => ({ success: true, data: undefined }),
      reloadPage: async () => ({ success: true, data: [] }),
    },
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(page.getByRole("button", { name: "搜索" }));
    expect(await page.findByText("搜索失败，请稍后重试")).toBeVisible();
  },
};
