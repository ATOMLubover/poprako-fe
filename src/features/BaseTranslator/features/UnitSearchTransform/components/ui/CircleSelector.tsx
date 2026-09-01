import clsx from "clsx";

export type SelectionState = "checked" | "unchecked" | "mixed";

interface Props {
  label: string;
  state: SelectionState;
  disabled?: boolean;
  onClick: () => void;
}

export default function CircleSelector({
  label,
  state,
  disabled = false,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-label={label}
      aria-checked={state === "mixed" ? "mixed" : state === "checked"}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      onDoubleClick={(event) => { event.stopPropagation(); }}
      className={clsx(
        "flex size-6 shrink-0 items-center justify-center rounded-full",
        "transition-transform duration-150 active:scale-90",
        "motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-35",
      )}
    >
      <span
        className={clsx(
          "flex size-4 items-center justify-center rounded-full border-2",
          "transition-[border-color] duration-200 ease-out",
          "motion-reduce:transition-none",
          state === "unchecked"
            ? "border-orange-400"
            : "border-(--color-green-500)",
        )}
      >
        <span
          className={clsx(
            "size-1.5 rounded-full bg-(--color-green-500)",
            "transition-[opacity,transform] duration-150 ease-out",
            "motion-reduce:transition-none",
            state === "checked" ? "scale-100 opacity-100" : "scale-0 opacity-0",
          )}
        />
      </span>
    </button>
  );
}
