export function SoonBadge({ inverted = false }: { inverted?: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${
        inverted ? "bg-white/20 text-white" : "bg-stone-200 text-stone-600"
      }`}
    >
      Bientôt
    </span>
  );
}
