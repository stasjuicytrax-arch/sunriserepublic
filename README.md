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

- A Three.js portal with sixteen animated metal bands, pointer response, pause, reduced-motion behavior and an SVG alternative for devices without WebGL.
- Liquid-glass navigation adapted from the user's DIGITAL-EVENTS source reference.
- Scroll-driven opening of the interior frame and a carousel with keyboard-operable enlargement and swipe navigation.
- Atmospheric editorial section, interior details, planned opening on 31 December, and a Google Maps embed and directions for 11 Ngô Gia Tự.

## Asset provenance

- Main room, bar and lounge: extracted from the user's interior design PDF. Public crops show only the renderings. Interior design by NA Studio Saigon.
- Mirrors: user-supplied restroom visualization.
- Atmosphere: landscape and portrait images of fictional adult guests, generated with the built-in ImageGen tool on 2026-11-07. The landscape prompt called for two Vietnamese friends dancing in a crimson-lit club, framed from the torso up with sharp facial detail and dark negative space on the left for live typography.
- Location preview: street and building geometry from [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), ODbL. The interactive view and directions use Google Maps.
- Programme previews: Mix & Mangle, Rise & Shine and Tempo Rush use poster artwork cropped from page 33 of the supplied brand kit. These examples have no announced dates.
- Raster logo: original supplied artwork. The interface displays the monogram from it.
- Initial image concepts: `design/concepts/v1/`; superseded as the review format by the user's request to show actual working markup.

## Verification

- Production build succeeds.
- Local server returns HTTP 200.
- Source reviewed for navigation, dialogs, reduced motion and resource cleanup.
- The published site was checked in Chromium at 1440 px and 390 px. Checks covered the WebGL scene, pause, gallery navigation and enlargement, the mobile menu, and the embedded map.
- Safari behavior, physical device performance and the exact entrance marker still need verification.

Internal PDF files and temporary contact sheets are not public assets and must never be copied into public/ or deployed output.
