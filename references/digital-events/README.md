# DIGITAL-EVENTS: reference implementation of liquid-glass navigation

Saved on 2026-11-07 at the user's request for reuse in SUNRISE REPUBLIC.

- Website: https://stasjuicytrax-arch.github.io/DIGITAL-EVENTS/
- Repository: https://github.com/stasjuicytrax-arch/DIGITAL-EVENTS
- Source revision: `e4e2cd40b966116e45aba59cf46a2837f41b1e0a`.
- Files downloaded unchanged: `src/components/Nav.tsx`, `src/components/ui/liquid-glass.tsx`, `src/styles/globals.css`, `src/styles/tokens.css`, `package.json`.

This is a reference snapshot, not an installed application or a standalone working component. Nav.tsx imports content, routing, logos, utilities and animation helpers from the original project. During implementation, adapt those dependencies to SUNRISE REPUBLIC; do not copy DIGITAL-EVENTS branding, contact details or unrelated page content.

Observed in the browser: a centered floating glass navigation pill; scrolling down collapses it to the logo and menu button. In the source: 80px downward / 40px upward thresholds, 450ms contraction, an independent glass background, SVG displacement scale 32 and a CSS blur fallback. Visual behavior was inspected on desktop only; mobile and browser compatibility still require testing in the new project.

The original glass component explicitly says the 21st.dev prompt was not added and the implementation follows that project's DESIGN.md. It must not be represented as a verbatim copy of the 21st.dev component.

Additional user reference: https://21st.dev/@jahed/components/apple-tahoe-liquid-glass-button

On 2026-11-07, the 21st.dev page showed a successful Copy prompt notification, but the browser clipboard API returned no text. The Component.tsx tab displayed “Component source is locked”. The actual prompt and full component were therefore not obtained. If exact fidelity to that implementation is needed, obtain the prompt from the user. This does not block reuse of the user's DIGITAL-EVENTS navigation.
