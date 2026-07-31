import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
  id?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  light = false,
  id,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center"
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase",
            align === "center" && "justify-center",
            // The bright brand green fails text-contrast on white/light
            // backgrounds (~1.9:1) — it only reads well as text on the
            // dark navy background, so light-mode eyebrows use navy
            // instead and keep the green as a small accent dot.
            light ? "text-green" : "text-navy"
          )}
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green" />
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={cn(
          "text-3xl font-bold tracking-tight sm:text-4xl",
          light ? "text-white" : "text-navy"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-lg",
            light ? "text-white/70" : "text-slate"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
