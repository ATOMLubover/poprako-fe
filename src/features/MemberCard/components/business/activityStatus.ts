const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getMemberActivityColor(
  lastActiveAt: number | undefined,
  now = Date.now(),
): string {
  if (!lastActiveAt) return "bg-stone-300";

  const daysSinceLastActive = (now - lastActiveAt) / DAY_IN_MS;
  if (daysSinceLastActive <= 7) return "bg-[#2e5c33]";
  if (daysSinceLastActive <= 30) return "bg-amber-200";
  return "bg-stone-300";
}
