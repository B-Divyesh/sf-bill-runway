# Bill Runway visual thesis

## Direction: surreal editorial scenery

Bill Runway turns a tense, abstract question into a navigable place. The key scene is a long coral causeway crossing an ink-blue tidal landscape: dated obligations stand like small paper gates, income arrives as warm pools of light, and an uncovered period is a visible gap in the path. It is editorial rather than literal finance imagery—quiet, composed, and humane, with no coins, bank cards, dashboards, or false promises of wealth.

The interface follows the scene's grammar. Dates are waypoints, the running balance is altitude, and the next uncovered window is a break in the road. Decorative scenery appears only in the onboarding/empty state; once data exists, the timeline itself becomes the landscape.

## Palette

Light mode is a sun-bleached paper world; dark mode is the same coast at night.

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| background | `#F4EEDC` | `#101D2A` | paper / night sky |
| surface | `#FFF9EA` | `#172838` | raised sheets |
| surface-strong | `#E6DCC4` | `#203649` | controls and dividers |
| text | `#142738` | `#F9F1DD` | primary ink |
| muted | `#53626B` | `#BCC8C9` | secondary copy |
| accent | `#C64F36` | `#FF8B70` | coral runway and actions |
| accent contrast | `#FFFFFF` | `#17202A` | text on accent |
| success | `#176B50` | `#7BD6AD` | covered / paid |
| warning | `#8B5000` | `#FFC56E` | close margin |
| danger | `#A32D37` | `#FF9099` | uncovered amount |
| focus | `#136B82` | `#7BDCF3` | keyboard focus |

All text pairs meet WCAG AA. Statuses always use an icon/word and amount, never colour alone.

## Type and numbers

Headings use Georgia, a self-hosted-by-platform editorial serif that makes the planner feel like a calm printed almanac. Interface and body copy use the native system sans stack for speed and familiar controls. The scale is 14, 16, 20, 28, and clamp(36–64) px. Amounts and dates use tabular numerals. No font downloads are needed.

## Spacing and shape

An 8 px base rhythm with 4 px half-steps. Reading measure is 68 characters. Controls are at least 44 px high. Sheets use 18–28 px radii, but timeline rows are separated by whitespace and hairlines rather than nested cards. Asymmetric editorial crops and a narrow red route line keep the product distinct from a generic finance dashboard.

## Interaction grammar

- “Add bill” is the primary coral action; “Add income” is secondary ink.
- Forms open as native dialogs from their source controls and return focus on close.
- A date-range segmented control switches between the 60-day and free 12-month views.
- Timeline events enter from their date marker and marking paid softly collapses their emphasis.
- Destructive actions identify the item and require confirmation. Import validates before replacing data.
- Save, import, install, demo, and offline results are announced in a persistent polite live region.

## Motion

UI state transitions last 180–240 ms and animate only transform/opacity. The empty-state causeway has a single gentle 700 ms reveal, never loops. Under `prefers-reduced-motion: reduce`, transitions and scrolling are instant and the scene appears fully composed.

## Asset plan and provenance

Hero art is an original raster illustration generated for this product, then manually cropped and optimised to responsive WebP. App icons are hand-authored SVG-derived geometric causeway marks rendered locally to PNG. There are no stock assets, third-party icons, or external fonts.

### Prompt sheet

**Subject:** a long coral causeway across shallow ink-blue tidal flats, tiny ivory paper invoice gates placed along the path, one warm amber sun on the horizon, a subtle gap in the road before the light. **World/materials:** tactile cut-paper editorial set, plaster, folded paper, fine grain, restrained surreal scale. **Light/lens:** soft long morning shadows, elevated three-quarter view, 50 mm editorial still-life lens, ample quiet negative space. **Palette words:** parchment, ink blue, burnt coral, amber, sea-glass green. **Negative list:** no people, hands, text, letters, numbers, logos, bank cards, coins, currency symbols, charts, UI screenshots, watermarks, photoreal brands, generic gradients.

Generated on 2026-08-28 using the factory Azure OpenAI image deployment (`factory-image`) with the prompt above plus “no text, no watermark, no logos”. Generated imagery is original to Bill Runway and disclosed in the footer.

The 1200×630 social preview is a centre crop of that original hero image,
made locally with ImageMagick on 2026-08-30. No new source imagery was added.
