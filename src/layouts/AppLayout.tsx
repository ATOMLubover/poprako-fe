import clsx from "clsx";
import { useEffect, useState } from "react";
import { LayoutDashboard, BookOpen, Users, Mail, Settings } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/features/AppSidebar";
import { getMyUser } from "@/api/user";
import { listMyMembers } from "@/api/member";
import { listSysMails } from "@/api/sysMail";
import { useAppStore } from "@/store/app";
import LoadingCircle from "@/components/ui/LoadingCircle";
import {
  FirstRegistrationGuideDialog,
  readFirstRegistrationFlag,
  writeFirstRegistrationFlag,
} from "@/features/FirstRegistrationGuide";

const MAIL_PREFETCH_SIZE = 15;

const mobileNavItems = [
  { path: "/workspace", icon: LayoutDashboard, label: "工作区" },
  { path: "/comic-playground", icon: BookOpen, label: "漫画" },
  { path: "/member-list", icon: Users, label: "成员" },
  { path: "/system-mail", icon: Mail, label: "消息" },
  { path: "/settings", icon: Settings, label: "设置" },
];

function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const sysMailCache = useAppStore((s) => s.sysMailCache);
  const hasUnread = sysMailCache?.mails.some((m) => !m.isRead) ?? false;

  return (
    <nav
      className={clsx(
        "fixed bottom-0 left-0 right-0 z-50 sm:hidden",
        "flex h-14 items-center justify-around",
        "bg-[#E8DCC4]/95 backdrop-blur-sm border-t border-stone-200",
      )}
    >
      {mobileNavItems.map((item) => {
        const isActive = location.pathname === item.path;
        const isShowBadge = item.path === "/system-mail" && hasUnread;
        return (
          <button
            key={item.path}
            type="button"
            onClick={() => { void navigate(item.path); }}
            className={clsx(
              "flex flex-col items-center gap-0.5 px-4 py-1 transition-colors",
              isActive ? "text-[#166534]" : "text-[#7A6D63]",
            )}
          >
            <span className="relative">
              <item.icon size={20} strokeWidth={isActive ? 2.4 : 2} />
              {isShowBadge && (
                <span
                  className={clsx(
                    "absolute -top-0.5 -right-0.5",
                    "w-1.5 h-1.5 rounded-full bg-red-400",
                  )}
                />
              )}
            </span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default function AppLayout() {
  const navigate = useNavigate();
  const loginState = useAppStore((s) => s.loginState);
  const setLoginState = useAppStore((s) => s.setLoginState);
  const sysMailCache = useAppStore((s) => s.sysMailCache);
  const setSysMailCache = useAppStore((s) => s.setSysMailCache);
  const [isReady, setIsReady] = useState(loginState !== null);
  const [showFirstRegistrationGuide, setShowFirstRegistrationGuide] = useState(
    () => loginState !== null && !readFirstRegistrationFlag(),
  );

  const closeFirstRegistrationGuide = () => {
    writeFirstRegistrationFlag(true);
    setShowFirstRegistrationGuide(false);
  };

  useEffect(() => {
    if (loginState !== null) {
      setIsReady(true); // eslint-disable-line react-hooks/set-state-in-effect, @eslint-react/set-state-in-effect
      setShowFirstRegistrationGuide(!readFirstRegistrationFlag()); // eslint-disable-line @eslint-react/set-state-in-effect
      return;
    }

    async function loadUser() {
      try {
        const userInfo = await getMyUser();
        const memberInfos = await listMyMembers({ ownerId: userInfo.id });
        setLoginState({ userInfo, memberInfos });
        setIsReady(true);
        setShowFirstRegistrationGuide(!readFirstRegistrationFlag());
      } catch {
        void navigate("/login", { replace: true });
      }
    }

    void loadUser();
  }, [loginState, navigate, setLoginState]);

  useEffect(() => {
    if (sysMailCache !== null) {return;}
    async function loadMail() {
      const result = await listSysMails(0, MAIL_PREFETCH_SIZE + 1);
      if (!result.success) {return;}
      const batch = result.data.slice(0, MAIL_PREFETCH_SIZE);
      const hasMore = result.data.length > MAIL_PREFETCH_SIZE;
      setSysMailCache({ mails: batch, hasMore });
    }

    void loadMail();
  }, [sysMailCache, setSysMailCache]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingCircle />
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#FEFDF9]">
      <AppSidebar />
      <main
        className={clsx(
          "flex-1 min-h-0 w-full overflow-y-auto",
          "sm:pl-14",
          "pb-14 sm:pb-0",
        )}
      >
        <Outlet />
      </main>
      <MobileBottomNav />
      {showFirstRegistrationGuide && (
        <FirstRegistrationGuideDialog
          onClose={closeFirstRegistrationGuide}
          onOpenSettings={() => {
            closeFirstRegistrationGuide();
            void navigate("/settings");
          }}
        />
      )}
    </div>
  );
}
