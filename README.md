# SUNRISE REPUBLIC

Interactive preview of the SUNRISE REPUBLIC nightclub, built with React, Vite, Three.js and GSAP. The design system is in `DESIGN.md`. The standalone Russian brief is in `ТЗ ДЛЯ САЙТА.md`.

GitHub Pages builds and publishes pushes to `main`.

## Run

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173/ on this computer. Production check: `npm run build`; production preview: `npm run preview`.

## Included

- Animated Three.js sunrise sculpture with pointer response, pause control, reduced-motion behavior and a static CSS fallback.
- Liquid-glass navigation adapted from the user's DIGITAL-EVENTS source reference.
- Interior carousel with three images, keyboard-operable enlargement and swipe navigation.
- Atmospheric editorial section, interior details, planned opening on 31 December, and a Google Maps embed and directions for 11 Ngô Gia Tự.

## Asset provenance

- Main room, bar and lounge: extracted from the user's interior design PDF. Public crops show only the renderings. Interior design by NA Studio Saigon.
- Mirrors: user-supplied restroom visualization.
- Atmosphere: AI-generated editorial image of fictional adult guests; it is not a photograph of an event at this unopened club. Created with the built-in Imagegen tool on 2026-11-07.
- Raster logo: original supplied artwork. The interface displays the monogram from it.
- Initial image concepts: `design/concepts/v1/`; superseded as the review format by the user's request to show actual working markup.

## Verification

- Production build succeeds.
- Local server returns HTTP 200.
- Source reviewed for navigation, dialogs, reduced motion and resource cleanup.
- Rendered desktop/mobile, real browser glass compatibility and animation performance remain unverified: browser control returned “Local browser use is disabled in Work settings”.

Internal PDF files and temporary contact sheets are not public assets and must never be copied into public/ or deployed output.
