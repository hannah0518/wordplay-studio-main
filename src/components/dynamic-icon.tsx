import * as Lucide from "lucide-react";
import type { LucideProps } from "lucide-react";

const toPascal = (name: string) =>
  name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

export function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
  const registry = Lucide as unknown as Record<
    string,
    React.ComponentType<LucideProps> | undefined
  >;
  const Icon = registry[toPascal(name)] ?? Lucide.Sparkles;
  return <Icon {...props} />;
}
