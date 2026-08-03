# Logo files

Place the official Østfold Bud Service AS logo files here, for example:

- `obs-logo@2x.png` — full logo, dark text (for light backgrounds)
- `obs-logo-white-bg@2x.png` — full logo, light text (for dark backgrounds)
- `obs-icon-256.png` — square icon mark

Once added, update `components/Logo.tsx` and `components/LogoIcon.tsx` to
render these files with `next/image` instead of the placeholder SVG mark,
and replace `app/icon.tsx`, `app/apple-icon.tsx` and
`app/opengraph-image.tsx` with versions built from the real icon.

See the project README for the full checklist.
