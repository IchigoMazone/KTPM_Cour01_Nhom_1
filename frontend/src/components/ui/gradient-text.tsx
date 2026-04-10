export function GradientText({
  children,
  className,
  from = "#3b82f6",
  to = "#22d3ee",
}: {
  children: React.ReactNode;
  className?: string;
  from?: string;
  to?: string;
}) {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${className || ""}`}
      style={{ backgroundImage: `linear-gradient(to right, ${from}, ${to})` }}
    >
      {children}
    </span>
  );
}
