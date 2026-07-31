/**
 * PLACEHOLDER MARK — Østfold Bud Service AS does not yet have the source
 * files for its square icon (e.g. obs-icon-256.png) in this project.
 *
 * This SVG is a stand-in built from the brief (navy square, green arrow
 * motion motif) so the site has a consistent icon in the header, favicon
 * and social preview. Replace it by swapping the file this component
 * renders once the real icon file is added to /public/logos/, or render
 * a Next.js <Image> pointing at that file instead.
 */
type LogoIconProps = {
  className?: string;
  rounded?: boolean;
};

export function LogoIcon({ className, rounded = true }: LogoIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Østfold Bud Service AS-ikon"
    >
      <rect
        width="64"
        height="64"
        rx={rounded ? 16 : 0}
        fill="#152239"
      />
      <path
        d="M14 20 L30 32 L14 44"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M30 20 L46 32 L30 44"
        stroke="#20D66B"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
