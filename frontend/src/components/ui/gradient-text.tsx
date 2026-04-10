export function GradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-block bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent ${className || ""}`}
    >
      {children}
    </span>
  );
}
