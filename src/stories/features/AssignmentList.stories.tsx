import type { Meta, StoryObj } from "@storybook/react-vite";
import type { AssignmentInfo } from "@/types/assignment";
import type { ChapterInfo } from "@/types/chapter";
import type { ComicInfo } from "@/types/comic";

interface AssignmentListProps {
  mode: "translator" | "reviewer";
  onMyLoadAssignments: (
    offset: number,
    limit: number,
  ) => Promise<AssignmentInfo[] | string>;
  onLoadChapterAssignments: (chapterId: string) => Promise<AssignmentInfo[]>;
}

function AssignmentList({
  mode,
  onMyLoadAssignments: _onMyLoadAssignments,
  onLoadChapterAssignments: _onLoadChapterAssignments,
}: AssignmentListProps) {
  return (
    <div className="rounded border border-border p-4 text-sm text-muted-foreground">
      AssignmentList Story Placeholder ({mode})
    </div>
  );
}

const meta: Meta<typeof AssignmentList> = {
  title: "features/AssignmentList",
  component: AssignmentList,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof AssignmentList>;

const now = Date.now();

function makeMockComic(idx: number): ComicInfo {
  return {
    id: `comic-${String(idx)}`,
    worksetId: "workset-0",
    title: `测试漫画 ${String(idx + 1)}`,
    author: `作者 ${String(idx + 1)}`,
    description: "这是一部测试用的漫画",
    index: idx,
    chapterCount: 10,
    creatorId: "user-0",
    coverUrl: "",
    isCoverUploaded: false,
    lastActiveAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

function makeMockChapter(idx: number): ChapterInfo {
  return {
    id: `chapter-${String(idx)}`,
    comicId: `comic-${String(idx % 3)}`,
    comic: makeMockComic(idx % 3),
    index: idx + 1,
    subtitle: `第${String(idx + 1)}话`,
    isPinned: false,
    pageCount: 18 + idx,
    totalUnitCount: 120 + idx * 10,
    translatedUnitCount: 80 + idx * 5,
    proofreadUnitCount: 40 + idx * 2,
    uploadedAt: now - 1000 * 60 * 60 * 24 * 3,
    translatingAt: now - 1000 * 60 * 60 * 12,
    creatorId: "user-0",
    createdAt: now,
    updatedAt: now,
  };
}

const mockAssignments: AssignmentInfo[] = Array.from({ length: 12 }, (_, idx) => ({
    id: `assignment-${String(idx)}`,
    chapterId: `chapter-${String(idx)}`,
    chapter: makeMockChapter(idx),
    userId: "mock-user-1",
    assignedTranslatorAt: idx % 2 === 0 ? now : undefined,
    assignedProofreaderAt: idx % 3 === 0 ? now : undefined,
    createdAt: now,
    updatedAt: now,
  }));

// reviewer 模式下，chapter 内的各分工人员 mock
const mockChapterAssignments: AssignmentInfo[] = [
  {
    id: "ca-1",
    chapterId: "chapter-0",
    userId: "translator-1",
    user: {
      id: "translator-1",
      name: "李翻译",
      qq: "",
      avatarUrl: "",
      isSuperAdmin: false,
      lastActiveAt: now,
      createdAt: now,
      updatedAt: now,
    },
    assignedTranslatorAt: now,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "ca-2",
    chapterId: "chapter-0",
    userId: "proofreader-1",
    user: {
      id: "proofreader-1",
      name: "王校对",
      qq: "",
      avatarUrl: "",
      isSuperAdmin: false,
      lastActiveAt: now,
      createdAt: now,
      updatedAt: now,
    },
    assignedProofreaderAt: now,
    createdAt: now,
    updatedAt: now,
  },
];

export const TranslatorMode: Story = {
  args: {
    mode: "translator",
    onMyLoadAssignments: async (offset: number, limit: number) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return mockAssignments.slice(offset, offset + limit);
    },
    onLoadChapterAssignments: () => Promise.resolve(mockChapterAssignments),
  },
};

export const ReviewerMode: Story = {
  args: {
    mode: "reviewer",
    onMyLoadAssignments: async (offset: number, limit: number) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return mockAssignments.slice(offset, offset + limit);
    },
    onLoadChapterAssignments: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockChapterAssignments;
    },
  },
};

export const ErrorState: Story = {
  args: {
    mode: "translator",
    onMyLoadAssignments: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return "加载失败，请检查网络连接";
    },
    onLoadChapterAssignments: () => Promise.resolve([]),
  },
};
