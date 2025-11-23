# Agent Brief

## Context
- This repo is a test case for joinwarp.com.
- Goal: build a calendar view experience while matching Warp's visual language so we can transition to a custom UI seamlessly.
- Step one: recreate Warp's base assets (fonts, tokens, layouts) to enable rapid UI work.

## Progress
- ✅ Downloaded Warp's Macan font files, added `@font-face` declarations, and wired the font stack globally.
- ✅ Extracted Warp's color palette and typography scale as CSS custom properties.
- ✅ Built class extraction system to analyze reference.html and extract all Tailwind patterns.
- ✅ Generated complete tailwind.config.js with all semantic tokens (fg, bg, text-*, border-*, etc.).
- ✅ Updated all components (Button, Input, Select, Textarea) to use pure Tailwind utilities.
- ✅ Removed custom CSS classes (.warp-button, .warp-input, etc.) in favor of utility composition.
- ✅ Updated page.tsx to match reference.html structure and classes exactly.
- 🎯 Now using Warp's exact approach: Tailwind utilities + extended config.

## Next Tasks Before Custom UI
1. Extract reusable button styles and interaction states (primary, secondary, subtle) that map to Warp's design tokens.
2. Build shared layout primitives (grid wrappers, card shells) so future screens keep consistent spacing and shadows.
3. Introduce a shared form component library (inputs, selects, toggles) aligned with the recreated styling to avoid per-page duplication.
4. Investigate app.joinwarp.com with CLI-friendly introspection tools (e.g., scraping/asset export utilities) so we can inspect the source CSS/JS ourselves instead of relying on manual snapshots.

---

## Current Workflow
1. **Fetch live production CSS**  
   ```bash
   npm run warp:fetch
   ```
   Downloads `6f7724a58a14cab1.css` and `8e8a01bc8e699344.css` into `reference-source/`. These are the same chunks Warp serves from `/checkout`.

2. **Extract tokens/custom properties**  
   ```bash
   npm run warp:extract
   ```
   Parses the main CSS chunk with PostCSS and writes every `:root`, `.force-light`, and `.dark` rule into `styles/generated/warp-tokens.css`. This file is imported at the top of `app/globals.css` and should never be edited manually—rerun the extractor when Warp updates their tokens.

3. **Alias + component styling**  
   `app/globals.css` remaps Warp’s variables to the lightweight `--warp-*` aliases we use in components, and defines handcrafted `.warp-button` / `.warp-input` classes driven directly by those aliases. Any new component (selects, toggles, cards, etc.) should follow this pattern: reuse tokens, recreate the DOM that Warp’s CSS expects, and expose React primitives under `components/ui/`.

## Progress Snapshot
- Fonts, color palette, and typography scale are sourced from Warp’s live CSS via the extractor (imported into `app/globals.css`).
- `<Button>` now implements Warp’s primary secondary, and subtle baseline styling plus disabled/focus behaviour, without depending on scraped class strings.
- `<Input>` mirrors Warp’s text field treatment (sizing, placeholder, focus ring, invalid state). The “Team size” control in `app/page.tsx` already uses it.
- Automation scripts exist for refreshing CSS snapshots (`warp:fetch`, `warp:extract`) so staying in sync is repeatable.

## Outstanding Work for Parity
1. **Button states** – Audit Warp’s live `group/button` selectors for secondary/subtle hover, pressed (`data-active`), loading, icon spacing, and multi-button group spacing. Mirror any missing state in `.warp-button` and expose props so the React component can toggle them.
2. **Form library expansion** – Build `<Select>`, `<Textarea>`, toggle/switch components, and grouped inputs (label, helper/error messaging) using the same token-driven approach. Ensure hover/disabled/invalid states use the exact colors from the extracted CSS.
3. **Layout primitives** – Recreate Warp’s grid wrappers, card shells, sidebar/header spacing, and elevation tokens so future pages can compose them without bespoke CSS. Inspect the downloaded CSS for classes like `.group/checkout`, `.bg-bg2`, `.border-divider`, etc., and port them into reusable utility classes or components.
4. **Typography utilities** – Map the remaining text utilities (status, tag, tab, caption) and verify they match leakage from `styles/generated/warp-tokens.css`. Replace ad-hoc Tailwind font sizes with these utilities throughout `app/page.tsx`.
5. **Global parity audit** – Remove `<link>` tags that import Warp’s compiled CSS once we have recreated all referenced selectors locally. Before removing, ensure every `.group/...` / `[data-slot=…]` combination used in the page has a local equivalent.
6. **Visual regression spot checks** – Once key primitives are localized, compare screenshots of our checkout page versus `app.joinwarp.com/checkout` (desktop + tablet). Document any remaining mismatches (spacing, colors, shadows) so they can be addressed systematically.
