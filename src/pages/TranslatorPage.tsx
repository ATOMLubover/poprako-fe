import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import WebTranslator from "@/features/WebTranslator";
import { useAppStore } from "@/store/app";
import { getMyUser } from "@/api/user";
import { listMyMembers } from "@/api/member";
import LoadingCircle from "@/components/ui/LoadingCircle";

export default function TranslatorPage() {
  const { chapterId, pageId } = useParams<{
    chapterId: string;
    pageId: string;
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginState = useAppStore((s) => s.loginState);
  const setLoginState = useAppStore((s) => s.setLoginState);
  const [isAuthReady, setIsAuthReady] = useState(loginState !== null);
  const returnTo = searchParams.get("returnTo");
  const returnComicId = searchParams.get("comicId");
  const returnChapterId = searchParams.get("chapterId");
  const startMode = searchParams.get("readOnly") === "true"
    ? "readOnly" as const
    : "auto" as const;

  const handleExit = () => {
    if (
      returnComicId && returnChapterId &&
      (returnTo === "/workspace" || returnTo === "/comic-playground")
    ) {
      const nextSearchParams = new URLSearchParams({
        comicId: returnComicId,
        chapterId: returnChapterId,
      });

      void navigate({
        pathname: returnTo,
        search: `?${nextSearchParams.toString()}`,
      });
      return;
    }

    void navigate(-1);
  };

  // Ensure user is authenticated before rendering translator
  useEffect(() => {
    if (loginState !== null) {
      // eslint-disable-next-line @eslint-react/set-state-in-effect, react-hooks/set-state-in-effect
      setIsAuthReady(true);
      return;
    }

    async function loadUser() {
      try {
        const userInfo = await getMyUser();
        const memberInfos = await listMyMembers({ ownerId: userInfo.id });
        setLoginState({ userInfo, memberInfos });

        setIsAuthReady(true);
      } catch {
        void navigate("/login", { replace: true });
      }
    }
    void loadUser();
  }, [loginState, navigate, setLoginState]);

  if (!isAuthReady) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <LoadingCircle />
      </div>
    );
  }

  if (!chapterId) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <p className="text-sm text-destructive">缺少章节 ID</p>
      </div>
    );
  }

  if (!pageId) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <p className="text-sm text-destructive">缺少页面 ID</p>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full">
      <WebTranslator
        chapterId={chapterId}
        startPageId={pageId}
        onExit={handleExit}
        startMode={startMode}
      />
    </div>
  );
}
