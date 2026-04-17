interface QuickRepliesProps {
  options: string[];
  onPick: (value: string) => void;
}

export function QuickReplies({ options, onPick }: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          type="button"
          key={option}
          onClick={() => onPick(option)}
          className="rounded-full border bg-white px-3 py-1 text-xs hover:border-indigo-300"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
