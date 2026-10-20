export function SoonBadge({ inverted = false }: { inverted?: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${
        inverted ? "bg-page/20 text-page" : "bg-subtle text-muted"
      }`}
    >
      Bientôt
    </span>
  );
}
