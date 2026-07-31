/**
 * PLACEHOLDER ILLUSTRATION — no real photos of the vehicles exist in this
 * project yet. This stylized van graphic stands in for a real photo.
 *
 * To replace: add a photo to /public/images/fleet/ (e.g.
 * "maxus-e-deliver.jpg"), set the `image` field for the vehicle in
 * data/vehicles.ts, and swap this component for a Next.js <Image> in
 * Fleet.tsx.
 */
export function VehiclePlaceholder({
  className,
  accent = "#20D66B",
}: {
  className?: string;
  accent?: string;
}) {
  return (
    <svg
      viewBox="0 0 480 280"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <rect width="480" height="280" fill="#0D1626" />
      <g opacity="0.5">
        <path d="M-20 210 L500 210" stroke="#152239" strokeWidth="2" />
        <path d="M-20 170 L200 170" stroke={accent} strokeOpacity="0.25" strokeWidth="2" />
        <path d="M280 130 L500 130" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="2" />
      </g>
      {/* Van body */}
      <g transform="translate(90,90)">
        <rect x="0" y="30" width="220" height="80" rx="10" fill="#152239" stroke="#28324a" />
        <path d="M220 40 L270 40 L300 70 L300 100 L220 100 Z" fill="#152239" stroke="#28324a" />
        <rect x="230" y="55" width="45" height="28" rx="4" fill={accent} fillOpacity="0.18" stroke={accent} strokeOpacity="0.5" />
        <circle cx="60" cy="112" r="18" fill="#0D1626" stroke="#3a4560" strokeWidth="4" />
        <circle cx="245" cy="112" r="18" fill="#0D1626" stroke="#3a4560" strokeWidth="4" />
        <rect x="18" y="45" width="60" height="26" rx="3" fill={accent} fillOpacity="0.12" stroke={accent} strokeOpacity="0.4" />
        <rect x="88" y="45" width="60" height="26" rx="3" fill={accent} fillOpacity="0.12" stroke={accent} strokeOpacity="0.4" />
      </g>
      <text
        x="240"
        y="250"
        textAnchor="middle"
        fill="#FFFFFF"
        fillOpacity="0.35"
        fontSize="12"
        fontFamily="sans-serif"
        letterSpacing="1.5"
      >
        BILDE KOMMER
      </text>
    </svg>
  );
}
