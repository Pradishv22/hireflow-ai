import type { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <article className="group relative border-t border-border pt-6 transition-colors duration-300 hover:border-foreground/40">
      <span className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-foreground transition-colors duration-300 group-hover:bg-ink group-hover:text-ink-foreground">
        <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.7} />
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </article>
  );
}
