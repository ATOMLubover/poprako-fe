import clsx from "clsx";
import { splitLiteralMatches } from "../../searchTransform";

interface Props {
  text: string;
  phrase: string;
}

export default function HighlightedText({ text, phrase }: Props) {
  return (
    <span className="whitespace-pre-wrap break-words">
      {splitLiteralMatches(text, phrase).map((segment, index) =>
        segment.matched ? (
          <mark
            key={`${String(index)}-${segment.text}`}
            className={clsx(
              "rounded-sm bg-(--color-red-50) px-0.5 text-(--color-red-500)",
            )}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={`${String(index)}-${segment.text}`}>{segment.text}</span>
        ),
      )}
    </span>
  );
}
