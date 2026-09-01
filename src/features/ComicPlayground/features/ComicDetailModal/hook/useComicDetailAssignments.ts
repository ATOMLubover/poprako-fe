import { useCallback, useEffect, useMemo, useState } from "react";
import { showLocalApiFailure, showLocalCaughtError } from "@/api/util";
import type { AssignmentInfo } from "@/types/assignment";
import type { MemberInfo } from "@/types/member";
import { hasRole, type Role } from "@/types/role";
import type { ToastType } from "@/components/ui/NotificationToast";
import { assignmentRolesForStage } from "../assignmentStage";
import type { ComicDetailModalProps } from "../types";

type ShowToast = (message: string, type: ToastType) => void;

interface Args {
  selectedChapterId: string | null;
  isSelectedChapterAvailable: boolean;
  currentUserId?: string | null | undefined;
  activeMember: MemberInfo | null;
  pinnedChapterId?: string | null | undefined;
  pinnedChapterAssignments?: AssignmentInfo[] | undefined;
  onLoadAssignments: ComicDetailModalProps["onLoadAssignments"];
  onAddAssignment?: ComicDetailModalProps["onAddAssignment"] | undefined;
  onRemoveAssignment?: ComicDetailModalProps["onRemoveAssignment"] | undefined;
  onJoinChapterRole?: ComicDetailModalProps["onJoinChapterRole"] | undefined;
  onWorkflowRecordsChanged?: (() => void) | undefined;
  showToast: ShowToast;
}

export function useComicDetailAssignments({
  selectedChapterId,
  isSelectedChapterAvailable,
  currentUserId,
  activeMember,
  pinnedChapterId,
  pinnedChapterAssignments,
  onLoadAssignments,
  onAddAssignment,
  onRemoveAssignment,
  onJoinChapterRole,
  onWorkflowRecordsChanged,
  showToast,
}: Args) {
  const [assignments, setAssignments] = useState<AssignmentInfo[]>([]);
  const [isAssignmentsLoading, setIsAssignmentsLoading] = useState(false);
  const [isMemberSelectorLoading, setIsMemberSelectorLoading] = useState(false);
  const [memberSelectorRole, setMemberSelectorRole] = useState<Role | null>(null);
  const [isAddingAssignment, setIsAddingAssignment] = useState(false);
  const [joiningRoles, setJoiningRoles] = useState<Partial<Record<Role, boolean>>>({});
  const [leavingRoles, setLeavingRoles] = useState<Partial<Record<Role, boolean>>>({});
  const [canCreateChapter, setCanCreateChapter] = useState(false);

  useEffect(() => {
    if (!selectedChapterId || !isSelectedChapterAvailable) {
      // eslint-disable-next-line @eslint-react/set-state-in-effect, react-hooks/set-state-in-effect
      setAssignments([]);
      setIsAssignmentsLoading(false); // eslint-disable-line @eslint-react/set-state-in-effect
      return;
    }

    let isCancelled = false;
    setAssignments([]); // eslint-disable-line @eslint-react/set-state-in-effect
    setIsAssignmentsLoading(true); // eslint-disable-line @eslint-react/set-state-in-effect
    const loadAssignments = async () => {
      try {
        const res = await onLoadAssignments(selectedChapterId);
        if (isCancelled) {return;}
        if (!res.success) {
          console.error("[ComicDetailModal] 加载分工失败:", res); // eslint-disable-line no-console
          showLocalApiFailure(res, showToast, "加载分工失败");
          return;
        }
        setAssignments(res.data);
      } catch (error) {
        if (isCancelled) {return;}
        console.error("[ComicDetailModal] 加载分工异常:", error); // eslint-disable-line no-console
        showLocalCaughtError(error, showToast, "加载分工失败");
      } finally {
        if (!isCancelled) {setIsAssignmentsLoading(false);}
      }
    };
    void loadAssignments();

    return () => {
      isCancelled = true;
    };
  }, [isSelectedChapterAvailable, onLoadAssignments, selectedChapterId, showToast]);

  const reloadAssignments = useCallback(async () => {
    if (!selectedChapterId) {return null;}
    setIsAssignmentsLoading(true);
    try {
      const refreshed = await onLoadAssignments(selectedChapterId);
      if (!refreshed.success) {
        console.error("[ComicDetailModal] 刷新分工失败:", refreshed); // eslint-disable-line no-console
        showLocalApiFailure(refreshed, showToast);
        return null;
      }
      setAssignments(refreshed.data);
      return refreshed.data;
    } catch (error) {
      console.error("[ComicDetailModal] 刷新分工异常:", error); // eslint-disable-line no-console
      showLocalCaughtError(error, showToast, "刷新分工失败");
      return null;
    } finally {
      setIsAssignmentsLoading(false);
    }
  }, [onLoadAssignments, selectedChapterId, showToast]);

  useEffect(() => {
    if (activeMember && hasRole(activeMember, "admin")) {
      // eslint-disable-next-line @eslint-react/set-state-in-effect, react-hooks/set-state-in-effect
      setCanCreateChapter(true);
      return;
    }

    if (!pinnedChapterId || !currentUserId) {
      setCanCreateChapter(false); // eslint-disable-line @eslint-react/set-state-in-effect
      return;
    }

    // 优先使用预加载的置顶章节分工数据，避免额外网络请求
    if (pinnedChapterAssignments) {
      const pinnedAssignment = pinnedChapterAssignments.find(
        (assignment) => assignment.userId === currentUserId,
      );
      setCanCreateChapter( // eslint-disable-line @eslint-react/set-state-in-effect
        pinnedAssignment !== undefined && hasRole(pinnedAssignment, "reviewer"),
      );
      return;
    }

    let isCancelled = false;

    const loadPinnedAssignments = async () => {
      try {
        const res = await onLoadAssignments(pinnedChapterId);
        if (!res.success) {
          // eslint-disable-next-line no-console
          console.error(
            "[ComicDetailModal] 加载 pinned 章节分工失败:", res,
          );
          if (!isCancelled) {
            setCanCreateChapter(false);
          }
          return;
        }

        const pinnedAssignment = res.data.find(
          (assignment) => assignment.userId === currentUserId,
        );

        if (!isCancelled) {
          setCanCreateChapter(
            pinnedAssignment !== undefined && hasRole(pinnedAssignment, "reviewer"),
          );
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
          "[ComicDetailModal] 加载 pinned 章节分工异常:", error,
        );
        if (!isCancelled) {
          setCanCreateChapter(false);
        }
      }
    };
    void loadPinnedAssignments();

    return () => {
      isCancelled = true;
    };
  }, [
    activeMember,
    currentUserId,
    onLoadAssignments,
    pinnedChapterAssignments,
    pinnedChapterId,
  ]);

  const currentAssignment = useMemo(
    () => assignments.find((item) => item.userId === currentUserId),
    [assignments, currentUserId],
  );

  const canTranslateOrProofread = currentAssignment !== undefined && (
    hasRole(currentAssignment, "translator") ||
    hasRole(currentAssignment, "proofreader")
  );
  const canReadOnly = activeMember !== null && !canTranslateOrProofread;
  const canManageChapterAssignments =
    currentAssignment !== undefined && hasRole(currentAssignment, "admin");
  const canUploadRawPages =
    currentAssignment !== undefined && hasRole(currentAssignment, "rawProvider");
  const isTeamAdmin = activeMember !== null && hasRole(activeMember, "admin");

  const removeRoles = useCallback(
    async (userId: string, roles: Role[]) => {
      if (!selectedChapterId || !onRemoveAssignment || roles.length === 0) {
        return false;
      }

      let isChanged = false;
      try {
        for (const role of roles) {
          const result = await onRemoveAssignment(selectedChapterId, userId, role);
          if (!result.success) {
            console.error("[ComicDetailModal] 移除角色失败:", result); // eslint-disable-line no-console
            showLocalApiFailure(result, showToast);
            if (isChanged) {await reloadAssignments();}
            return false;
          }
          isChanged = true;
        }

        await reloadAssignments();
        onWorkflowRecordsChanged?.();
        return true;
      } catch (error) {
        console.error("[ComicDetailModal] 移除角色异常:", error); // eslint-disable-line no-console
        showLocalCaughtError(error, showToast, "移除角色失败");
        if (isChanged) {await reloadAssignments();}
        return false;
      }
    },
    [
      onRemoveAssignment,
      onWorkflowRecordsChanged,
      reloadAssignments,
      selectedChapterId,
      showToast,
    ],
  );

  const handleRemoveAssignment = useCallback(
    (userId: string, role: Role) => {
      const assignment = assignments.find((item) => item.userId === userId);
      if (!assignment) {return;}
      void removeRoles(userId, assignmentRolesForStage(assignment, role));
    },
    [assignments, removeRoles],
  );

  const handleOpenMemberSelector = useCallback(
    (role: Role) => {
      if (!selectedChapterId) {return;}
      setMemberSelectorRole(role);
    },
    [selectedChapterId],
  );

  const handleAddAssignment = useCallback(
    async (userId: string) => {
      if (!selectedChapterId || !memberSelectorRole || !onAddAssignment) {return;}
      setIsAddingAssignment(true);
      const result = await onAddAssignment(selectedChapterId, userId, memberSelectorRole);
      setIsAddingAssignment(false);

      if (!result.success) {
        showLocalApiFailure(result, showToast);
        return;
      }

      await reloadAssignments();
      onWorkflowRecordsChanged?.();
      setMemberSelectorRole(null);
    },
    [
      memberSelectorRole,
      onAddAssignment,
      onWorkflowRecordsChanged,
      reloadAssignments,
      selectedChapterId,
      showToast,
    ],
  );

  const isRoleAlreadyJoined = useCallback(
    (role: Role) => {
      if (!currentAssignment) {return false;}
      if (role === "typesetter") {
        return (
          hasRole(currentAssignment, "typesetter") ||
          hasRole(currentAssignment, "redrawer")
        );
      }
      return hasRole(currentAssignment, role);
    },
    [currentAssignment],
  );

  const canJoinRole = useCallback(
    (role: Role) => {
      if (!activeMember || !onJoinChapterRole || !selectedChapterId || !currentUserId) {
        return false;
      }
      return hasRole(activeMember, role) && !isRoleAlreadyJoined(role);
    },
    [activeMember, currentUserId, isRoleAlreadyJoined, onJoinChapterRole, selectedChapterId],
  );

  const canLeaveRole = useCallback(
    (role: Role) => {
      if (!onRemoveAssignment || !selectedChapterId || !currentUserId) {
        return false;
      }
      return assignmentRolesForStage(currentAssignment, role).length > 0;
    },
    [currentAssignment, currentUserId, onRemoveAssignment, selectedChapterId],
  );

  const handleJoinRole = useCallback(
    async (role: Role) => {
      if (!selectedChapterId || !onJoinChapterRole || joiningRoles[role] === true) {return;}

      setJoiningRoles((prev) => ({ ...prev, [role]: true }));
      try {
        const result = await onJoinChapterRole(selectedChapterId, role);
        if (!result.success) {
          console.error("[ComicDetailModal] 加入章节分工失败:", result); // eslint-disable-line no-console
          showLocalApiFailure(result, showToast);
          return;
        }

        await reloadAssignments();
        onWorkflowRecordsChanged?.();
        showToast("加入分工成功", "success");
      } catch (error) {
        console.error("[ComicDetailModal] 加入章节分工异常:", error); // eslint-disable-line no-console
        showLocalCaughtError(error, showToast, "加入分工失败", true);
      } finally {
        setJoiningRoles((prev) => ({ ...prev, [role]: false }));
      }
    },
    [
      joiningRoles,
      onJoinChapterRole,
      onWorkflowRecordsChanged,
      reloadAssignments,
      selectedChapterId,
      showToast,
    ],
  );

  const handleLeaveRole = useCallback(
    async (role: Role) => {
      if (!selectedChapterId || !currentUserId || !onRemoveAssignment
        || leavingRoles[role] === true) {
        return;
      }

      setLeavingRoles((prev) => ({ ...prev, [role]: true }));
      try {
        const removableRoles = assignmentRolesForStage(currentAssignment, role);
        if (removableRoles.length === 0) {
          showToast("当前分工无需退出", "error");
          return;
        }

        const isRemoved = await removeRoles(currentUserId, removableRoles);
        if (isRemoved) {showToast("退出分工成功", "success");}
      } catch (error) {
        console.error("[ComicDetailModal] 退出章节分工异常:", error); // eslint-disable-line no-console
        showLocalCaughtError(error, showToast, "退出分工失败", true);
      } finally {
        setLeavingRoles((prev) => ({ ...prev, [role]: false }));
      }
    },
    [
      currentAssignment,
      currentUserId,
      leavingRoles,
      onRemoveAssignment,
      removeRoles,
      selectedChapterId,
      showToast,
    ],
  );

  return {
    assignments,
    setAssignments,
    isAssignmentsLoading,
    memberSelectorRole,
    setMemberSelectorRole,
    isMemberSelectorLoading,
    setIsMemberSelectorLoading,
    isAddingAssignment,
    joiningRoles,
    leavingRoles,
    currentAssignment,
    canTranslateOrProofread,
    canReadOnly,
    canManageChapterAssignments,
    canUploadRawPages,
    isTeamAdmin,
    canCreateChapter,
    reloadAssignments,
    handleRemoveAssignment,
    handleOpenMemberSelector,
    handleAddAssignment,
    canJoinRole,
    canLeaveRole,
    handleJoinRole,
    handleLeaveRole,
  };
}
