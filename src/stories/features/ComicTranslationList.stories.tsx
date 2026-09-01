import type { Meta, StoryObj } from "@storybook/react-vite";
import ComicTranslationList from "../../features/ComcList/components/business/ComicTranslationList";
import type { ComicInfo } from "@/types/comic";
import type { ComicTranslationListItem } from "@/features/ComcList/types/types";
import type { Result } from "@/types/utils/result";

const meta: Meta<typeof ComicTranslationList> = {
  title: "features/ComicTranslationList",
  component: ComicTranslationList,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof ComicTranslationList>;

const now = Date.now();

function makeMockComic(idx: number): ComicInfo {
  return {
    id: `comic-${String(idx)}`,
    worksetId: "workset-0",
    title: `测试漫画 ${String(idx + 1)}`,
    author: `作者 ${String(idx + 1)}`,
    description: "这是一部测试用的漫画",
    index: idx,
    chapterCount: 10 + idx,
    creatorId: "user-0",
    coverUrl: "",
    isCoverUploaded: false,
    lastActiveAt: now - 1000 * 60 * 60 * idx,
    createdAt: now,
    updatedAt: now,
  };
}

const fullComics = Array.from({ length: 20 }, (_, index) => makeMockComic(index));

function makePagedLoader(allComics: ComicInfo[], delay = 800) {
  return async (
    offset: number,
    limit: number,
  ): Promise<Result<ComicTranslationListItem[]>> => {
    void offset;
    void limit;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return {
      success: true,
      data: allComics.slice(offset, offset + limit).map((comicInfo) => ({
        comicInfo,
        chapter: comicInfo.pinnedChapter,
      })),
    };
  };
}

export const TranslatorMode: Story = {
  args: {
    onLoadComics: makePagedLoader(fullComics),
  },
};

export const EmptyState: Story = {
  args: {
    onLoadComics: async (offset: number, limit: number) => {
      void offset;
      void limit;
      await new Promise((resolve) => setTimeout(resolve, 600));
      return { success: true, data: [] };
    },
  },
};

export const ErrorState: Story = {
  args: {
    onLoadComics: async (offset: number, limit: number) => {
      void offset;
      void limit;
      await new Promise((resolve) => setTimeout(resolve, 600));
      return { success: false, error: "服务器错误，请稍后重试" };
    },
  },
};

export const SmallDataSet: Story = {
  name: "小数据集（3条）",
  args: {
    onLoadComics: makePagedLoader(fullComics.slice(0, 3), 400),
  },
};
