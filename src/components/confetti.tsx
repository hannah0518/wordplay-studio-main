import { useEffect, useState } from "react";

const COLORS = [
  "var(--color-primary)",
  "var(--color-berry)",
  "var(--color-sky)",
  "var(--color-warning)",
  "var(--color-success)",
];

export function Confetti({ fire }: { fire: number }) {
  const [pieces, setPieces] = useState<
    { id: string; left: number; delay: number; color: string; size: number }[]
  >([]);

  useEffect(() => {
    if (!fire) return;
    const batch = Array.from({ length: 70 }, (_, i) => ({
      id: `${fire}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      color: COLORS[i % COLORS.length]!,
      size: 6 + Math.random() * 8,
    }));
    setPieces(batch);
    const timer = setTimeout(() => setPieces([]), 3000);
    return () => clearTimeout(timer);
  }, [fire]);

  if (!pieces.length) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 animate-confetti rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.6,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
