/* eslint-disable @eslint-react/use-state, @eslint-react/exhaustive-deps */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UnitInfo } from "@/types/unit";
import type { UserInfo } from "@/types/user";
import {
  UnitContributorCache,
  unitContributorIds,
  type UnitUserResolver,
} from "./unitContributorCache";

interface Args {
  units: UnitInfo[];
  onResolveUser: UnitUserResolver;
}

export function useUnitContributors({ units, onResolveUser }: Args) {
  const cacheRef = useRef(new UnitContributorCache());
  const [, setRevision] = useState(0);
  const contributorIds = useMemo(() => unitContributorIds(units), [units]);
  const contributorKey = contributorIds.join("\u{0}");

  useEffect(() => {
    let isActive = true;

    for (const userId of contributorIds) {
      void cacheRef.current.resolve(userId, onResolveUser).then((user) => {
        if (isActive && user) {setRevision((revision) => revision + 1);}
      });
    }

    return () => {
      isActive = false;
    };
    // contributorKey captures the deduplicated IDs without retriggering on array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contributorKey, onResolveUser]);

  return useCallback(
    (userId: string | null): UserInfo | undefined =>
      cacheRef.current.get(userId),
    [],
  );
}
