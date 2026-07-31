import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "secondary-dark";
type Size = "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-green text-navy hover:bg-green/90 hover:-translate-y-0.5 shadow-sm shadow-green/20",
  secondary:
    "bg-transparent text-white border border-white/30 hover:border-green hover:text-green",
  "secondary-dark":
    "bg-transparent text-navy border border-navy/20 hover:border-green hover:text-green",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  showArrow?: boolean;
  className?: string;
};

type ButtonAsLink = CommonProps & {
  href: string;
  onClick?: () => void;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const {
    children,
    variant = "primary",
    size = "md",
    showArrow = true,
    className,
  } = props;

  const classes = cn(base, variants[variant], sizes[size], className);

  const content = (
    <>
      {children}
      {showArrow && (
        <ArrowRight
          aria-hidden
          className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
        />
      )}
    </>
  );

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes} onClick={props.onClick}>
        {content}
      </Link>
    );
  }

  const {
    href: _href,
    children: _children,
    variant: _variant,
    size: _size,
    showArrow: _showArrow,
    className: _className,
    ...buttonProps
  } = props as ButtonAsButton;
  void _href;
  void _children;
  void _variant;
  void _size;
  void _showArrow;
  void _className;

  return (
    <button className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
