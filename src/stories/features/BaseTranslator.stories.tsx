import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import BaseTranslator from "@/features/BaseTranslator/components/business/BaseTranslator";
import {
  unitProofreadText,
  unitTranslatedText,
  type UnitInfo,
} from "@/types/unit";
import type { Project } from "@/types/project";
import type { PageImageQuality } from "@/types/page";
import type { UserInfo } from "@/types/user";
import type { UnitDiff } from "@/features/BaseTranslator/types/type";
import type {
  TerminologyDataSource,
  UnitSearchTransformDataSource,
} from "@/features/BaseTranslator";
import { expect, userEvent, within } from "storybook/test";

const DEMO_IMAGE =
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=80";

const TRANSLATOR_ID = "mock-translator";
const PROOFREADER_ID = "mock-proofreader";

const mockUnits = ([
  {
    id: "1",
    index: 0,
    isBubble: true,
    xCoord: 0.22,
    yCoord: 0.18,
    isProofread: false,
    translatedText: "——你在这里啊，终于找到你了。",
  },
  {
    id: "2",
    index: 1,
    isBubble: false,
    xCoord: 0.65,
    yCoord: 0.28,
    isProofread: false,
  },
  {
    id: "3",
    index: 2,
    isBubble: true,
    xCoord: 0.38,
    yCoord: 0.52,
    isProofread: true,
    translatedText: "不……这不可能。",
    proofreadText: "不……这怎么可能。",
  },
  {
    id: "4",
    index: 3,
    isBubble: true,
    xCoord: 0.72,
    yCoord: 0.62,
    isProofread: false,
    translatedText: "冷静下来，听我说。",
  },
  {
    id: "5",
    index: 4,
    isBubble: false,
    xCoord: 0.48,
    yCoord: 0.8,
    isProofread: false,
  },
  {
    id: "6",
    index: 5,
    isBubble: true,
    xCoord: 0.12,
    yCoord: 0.12,
    isProofread: false,
    translatedText: "这里发生了什么？",
  },
  {
    id: "7",
    index: 6,
    isBubble: true,
    xCoord: 0.28,
    yCoord: 0.2,
    isProofread: false,
  },
  {
    id: "8",
    index: 7,
    isBubble: false,
    xCoord: 0.54,
    yCoord: 0.33,
    isProofread: false,
    translatedText: "快点！",
  },
  {
    id: "9",
    index: 8,
    isBubble: true,
    xCoord: 0.41,
    yCoord: 0.45,
    isProofread: true,
    translatedText: "别乱动。",
    proofreadText: "别动！",
  },
  {
    id: "10",
    index: 9,
    isBubble: false,
    xCoord: 0.62,
    yCoord: 0.5,
    isProofread: false,
  },
  {
    id: "11",
    index: 10,
    isBubble: true,
    xCoord: 0.33,
    yCoord: 0.6,
    isProofread: false,
    translatedText: "你还好吗？",
  },
  {
    id: "12",
    index: 11,
    isBubble: false,
    xCoord: 0.7,
    yCoord: 0.22,
    isProofread: false,
  },
  {
    id: "13",
    index: 12,
    isBubble: true,
    xCoord: 0.18,
    yCoord: 0.7,
    isProofread: true,
    translatedText: "我没事。",
    proofreadText: "我没事，谢谢。",
  },
  {
    id: "14",
    index: 13,
    isBubble: true,
    xCoord: 0.9,
    yCoord: 0.4,
    isProofread: false,
    translatedText: "我们得走了。",
  },
  {
    id: "15",
    index: 14,
    isBubble: false,
    xCoord: 0.44,
    yCoord: 0.88,
    isProofread: false,
  },
  {
    id: "16",
    index: 15,
    isBubble: true,
    xCoord: 0.2,
    yCoord: 0.3,
    isProofread: false,
  },
  {
    id: "17",
    index: 16,
    isBubble: false,
    xCoord: 0.6,
    yCoord: 0.12,
    isProofread: false,
    translatedText: "看那边！",
  },
  {
    id: "18",
    index: 17,
    isBubble: true,
    xCoord: 0.27,
    yCoord: 0.44,
    isProofread: false,
  },
  {
    id: "19",
    index: 18,
    isBubble: true,
    xCoord: 0.5,
    yCoord: 0.5,
    isProofread: true,
    translatedText: "别信他。",
    proofreadText: "别听他的话。",
  },
  {
    id: "20",
    index: 19,
    isBubble: false,
    xCoord: 0.66,
    yCoord: 0.66,
    isProofread: false,
  },
  {
    id: "21",
    index: 20,
    isBubble: true,
    xCoord: 0.11,
    yCoord: 0.2,
    isProofread: false,
    translatedText: "怎么可能？",
  },
  {
    id: "22",
    index: 21,
    isBubble: false,
    xCoord: 0.35,
    yCoord: 0.27,
    isProofread: false,
  },
  {
    id: "23",
    index: 22,
    isBubble: true,
    xCoord: 0.46,
    yCoord: 0.32,
    isProofread: false,
    translatedText: "小心！",
  },
  {
    id: "24",
    index: 23,
    isBubble: false,
    xCoord: 0.58,
    yCoord: 0.42,
    isProofread: true,
    translatedText: "我来帮你。",
    proofreadText: "我会帮你。",
  },
  {
    id: "25",
    index: 24,
    isBubble: true,
    xCoord: 0.78,
    yCoord: 0.55,
    isProofread: false,
  },
  {
    id: "26",
    index: 25,
    isBubble: false,
    xCoord: 0.49,
    yCoord: 0.74,
    isProofread: false,
  },
  {
    id: "27",
    index: 26,
    isBubble: true,
    xCoord: 0.36,
    yCoord: 0.82,
    isProofread: false,
    translatedText: "别放弃。",
  },
  {
    id: "28",
    index: 27,
    isBubble: false,
    xCoord: 0.82,
    yCoord: 0.2,
    isProofread: false,
  },
  {
    id: "29",
    index: 28,
    isBubble: true,
    xCoord: 0.14,
    yCoord: 0.58,
    isProofread: false,
  },
  {
    id: "30",
    index: 29,
    isBubble: false,
    xCoord: 0.95,
    yCoord: 0.92,
    isProofread: true,
    translatedText: "结束了。",
    proofreadText: "终于结束了。",
  },
] satisfies UnitInfo[]).map((unit): UnitInfo => ({
  ...unit,
  ...(unitTranslatedText(unit) ? { translatorId: TRANSLATOR_ID } : {}),
  ...(unitProofreadText(unit) ? { proofreaderId: PROOFREADER_ID } : {}),
}));

const mockUsers = new Map<string, UserInfo>([
  [
    TRANSLATOR_ID,
    {
      id: TRANSLATOR_ID,
      qq: "10001",
      name: "森川秋",
      avatarUrl: "",
      isSuperAdmin: false,
      lastActiveAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  [
    PROOFREADER_ID,
    {
      id: PROOFREADER_ID,
      qq: "10002",
      name: "林澄",
      avatarUrl: "",
      isSuperAdmin: false,
      lastActiveAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
]);

const mockProject: Project = {
  id: "project-1",
  title: "测试漫画",
  author: "Demo",
  pageCount: 3,
  totalUnitCount: 15,
  translatedUnitCount: 8,
  proofreadUnitCount: 3,
  pages: [
    {
      id: "page-1",
      chapterId: "chapter-1",
      index: 0,
      imageUrl: DEMO_IMAGE,
      imageOptimizedUrl: DEMO_IMAGE,
      isUploaded: true,
      creatorId: "mock-user",
      totalUnitCount: 5,
      translatedUnitCount: 3,
      proofreadUnitCount: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "page-2",
      chapterId: "chapter-1",
      index: 1,
      imageUrl: DEMO_IMAGE,
      imageOptimizedUrl: DEMO_IMAGE,
      isUploaded: true,
      creatorId: "mock-user",
      totalUnitCount: 5,
      translatedUnitCount: 3,
      proofreadUnitCount: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "page-3",
      chapterId: "chapter-1",
      index: 2,
      imageUrl: DEMO_IMAGE,
      imageOptimizedUrl: DEMO_IMAGE,
      isUploaded: true,
      creatorId: "mock-user",
      totalUnitCount: 5,
      translatedUnitCount: 2,
      proofreadUnitCount: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
};

const meta: Meta<typeof BaseTranslator> = {
  title: "Features/BaseTranslator",
  component: BaseTranslator,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="h-screen w-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BaseTranslator>;
type BaseTranslatorProps = ComponentProps<typeof BaseTranslator>;

async function mockSaveUnits(pageId: string, diff: UnitDiff) {
  console.log("[mock] onSaveUnits", pageId, diff);
}

async function mockCompleteStage(stage: "translate" | "proofread") {
  console.log("[mock] onCompleteStage", stage);
}

async function mockResolveUser(userId: string) {
  const user = mockUsers.get(userId);
  return user
    ? { success: true as const, data: user }
    : { success: false as const, error: `Unknown user: ${userId}` };
}

const mockTerminology: TerminologyDataSource = {
  listTermbases: async () => ({
    success: true,
    data: [
      {
        id: "termbase-1",
        comicId: "comic-1",
        name: "角色称谓",
        description: "本作角色姓名与敬称",
        termCount: 2,
        creatorId: "mock-user",
        createdAt: 10,
        updatedAt: 20,
      },
    ],
  }),
  listTerms: async () => ({
    success: true,
    data: [
      {
        id: "term-1",
        termbaseId: "termbase-1",
        source: "団長",
        targets: ["团长"],
        creatorId: "mock-user",
        createdAt: 10,
        updatedAt: 20,
      },
    ],
  }),
  createTermbase: async () => ({ success: true, data: "termbase-new" }),
  updateTermbase: async () => ({ success: true, data: undefined }),
  deleteTermbase: async () => ({ success: true, data: undefined }),
  createTerm: async () => ({ success: true, data: "term-new" }),
  updateTerm: async () => ({ success: true, data: undefined }),
  deleteTerm: async () => ({ success: true, data: undefined }),
};

function createUnitSearchTransform(
  unitsByPage: Map<string, UnitInfo[]>,
): UnitSearchTransformDataSource {
  return {
    search: async ({ part, phrase }) => {
      return {
        success: true,
        data: [...unitsByPage.entries()].flatMap(([pageId, units]) =>
          units.flatMap((unit) => {
            const text = part === "translatedText"
              ? unitTranslatedText(unit)
              : unitProofreadText(unit);
            return text?.includes(phrase) ? [{ pageId, unit }] : [];
          }),
        ),
      };
    },
    transform: async ({ part, origin, target, unitIds }) => {
      const selectedIds = new Set(unitIds);
      for (const [pageId, units] of unitsByPage) {
        unitsByPage.set(pageId, units.map((unit) => {
          if (!selectedIds.has(unit.id)) return unit;

          if (part === "translatedText") {
            return {
              ...unit,
              translatedText: unitTranslatedText(unit)?.replaceAll(origin, target),
            };
          }
          return {
            ...unit,
            proofreadText: unitProofreadText(unit)?.replaceAll(origin, target),
          };
        }));
      }
      return { success: true, data: undefined };
    },
    reloadPage: async (pageId) => ({
      success: true,
      data: unitsByPage.get(pageId) ?? [],
    }),
  };
}

function createStoryArgs({
  canTranslate,
  canProofread,
  units = mockUnits,
}: {
  canTranslate: boolean;
  canProofread: boolean;
  units?: UnitInfo[];
}): BaseTranslatorProps {
  const unitsByPage = new Map(
    mockProject.pages.map((page) => [
      page.id,
      units.map((unit) => ({
        ...unit,
        id: `${page.id}-${unit.id}`,
      })),
    ]),
  );

  return {
    project: mockProject,
    canTranslate,
    canProofread,
    onLoadUnits: async (pageId: string) => unitsByPage.get(pageId) ?? [],
    onLoadPageImage: async (_pageId: string, _quality: PageImageQuality) =>
      DEMO_IMAGE,
    onSaveUnits: mockSaveUnits,
    onResolveUser: mockResolveUser,
    onCompleteStage: mockCompleteStage,
    unitSearchTransform: createUnitSearchTransform(unitsByPage),
    onExit: () => {
      console.log("[mock] onExit");
    },
  };
}

export const WithProofread: Story = {
  args: createStoryArgs({
    canTranslate: true,
    canProofread: true,
  }),
};

export const TranslatorOnly: Story = {
  args: createStoryArgs({
    canTranslate: true,
    canProofread: false,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "切换到只读模式",
    }));
    expect(await canvas.findAllByRole("textbox", {
      name: "翻译与校对差异",
    })).toHaveLength(mockUnits.length);

    await userEvent.click(canvas.getByRole("button", {
      name: "切换到翻译模式",
    }));
    expect(canvas.queryByRole("textbox", {
      name: "翻译与校对差异",
    })).toBeNull();
    expect(canvas.getByRole("button", {
      name: "切换到只读模式",
    })).toBeVisible();
  },
};

export const SearchAndTransform: Story = {
  args: createStoryArgs({
    canTranslate: true,
    canProofread: false,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "工具菜单" }));
    await userEvent.click(page.getByTitle("搜索与替换"));
    expect(page.getByRole("dialog", { name: "搜索与替换" })).toBeVisible();

    await userEvent.type(page.getByRole("textbox", { name: "查找短语" }), "这");
    await userEvent.click(page.getByRole("button", { name: "搜索" }));
    expect(await page.findByText("3 个匹配 Unit")).toBeVisible();

    await userEvent.type(page.getByRole("textbox", { name: "替换短语" }), "那");
    await userEvent.click(page.getByRole("button", { name: "替换" }));
    expect(await page.findByText("没有找到匹配内容")).toBeVisible();
  },
};

export const EmptyUnits: Story = {
  args: createStoryArgs({
    canTranslate: true,
    canProofread: true,
    units: [],
  }),
};

export const WithTerminology: Story = {
  args: {
    ...createStoryArgs({
      canTranslate: true,
      canProofread: true,
    }),
    terminology: mockTerminology,
  },
};

export const ReadOnlyWithoutTerminology: Story = {
  args: {
    ...createStoryArgs({
      canTranslate: false,
      canProofread: false,
    }),
    terminology: mockTerminology,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByTestId("terminology-lookup")).toBeNull();
    expect(await canvas.findAllByRole("textbox", {
      name: "翻译与校对差异",
    })).toHaveLength(mockUnits.length);

    await userEvent.click(canvas.getByRole("button", {
      name: "切换到标准 Unit 视图",
    }));
    expect(canvas.queryByRole("textbox", {
      name: "翻译与校对差异",
    })).toBeNull();
    expect(canvas.getByRole("button", {
      name: "切换到 Diff Unit 视图",
    })).toBeVisible();
  },
};
