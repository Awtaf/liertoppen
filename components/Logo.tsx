import { LogoIcon } from "./LogoIcon";
import { companyInfo } from "@/config/company";

/**
 * PLACEHOLDER LOGO — see LogoIcon.tsx for context. This full wordmark
 * lockup stands in for the real files (obs-logo@2x.png for dark text /
 * obs-logo-white-bg@2x.png for light backgrounds). Swap it for a
 * `next/image` render of the real files before launch — do not stretch,
 * recolor or reproportion the real logo when that happens.
 *
 * `variant="light"` = light/white text, for use on dark (navy) backgrounds.
 * `variant="dark"` = navy text, for use on white/light backgrounds.
 */
type LogoProps = {
  variant?: "light" | "dark";
  className?: string;
  iconOnly?: boolean;
};

export function Logo({ variant = "dark", className, iconOnly = false }: LogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-navy";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoIcon className="h-9 w-9 shrink-0" />
      {!iconOnly && (
        <span className="flex flex-col leading-tight">
          <span className={`text-base font-bold tracking-tight ${textColor}`}>
            {companyInfo.shortName}
          </span>
          <span
            className={`text-[11px] font-medium tracking-wide uppercase ${
              variant === "light" ? "text-white/60" : "text-slate"
            }`}
          >
            Transport &amp; distribusjon
          </span>
        </span>
      )}
    </span>
  );
}
