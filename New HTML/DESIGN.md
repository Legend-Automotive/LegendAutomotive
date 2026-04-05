# Design System: High-End Editorial for Legend Automotive

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Sovereign Gallery."** 

Unlike standard e-commerce automotive sites that feel cluttered and transactional, this system treats every vehicle as a masterpiece within a curated exhibition. We move away from the "template" look of the reference image by embracing high-contrast tonal depth, expansive negative space, and intentional asymmetry. The layout should feel like a premium lifestyle magazine—authoritative, exclusive, and powerful. We use "Legend Automotive" not just as a name, but as an experience of permanence and luxury.

## 2. Colors
Our palette is anchored in deep, atmospheric blacks and metallic golds. This isn't just "Dark Mode"; it is a luxury environment designed to let the vehicle photography shine.

*   **Primary Hierarchy:** Use `primary` (#f2ca50) and `primary_container` (#d4af37) exclusively for gold-leaf accents, key CTAs, and sophisticated status indicators.
*   **Surface Depth:** We utilize the `surface_container` tokens to create a "nested" world.
    *   `background` (#131313) is our void.
    *   `surface_container_low` (#1c1b1b) and `surface_container_high` (#2a2a2a) are used to define regions without lines.

### The "No-Line" Rule
Solid 1px borders are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts. For example, a vehicle detail card (`surface_container_lowest`) should sit on a `surface_container_low` section to create distinction.

### The "Glass & Gradient" Rule
To elevate the interface beyond a flat digital screen, floating elements (like price badges or navigation bars) should utilize **Glassmorphism**. 
*   **Spec:** Use semi-transparent versions of `surface_container` with a `backdrop-blur` (20px-40px). 
*   **Soulful Gradients:** For Hero backgrounds or Primary CTAs, use a subtle linear gradient from `primary` (#f2ca50) to `primary_container` (#d4af37) at a 135-degree angle to mimic the sheen of polished gold.

## 3. Typography
Typography is the voice of the brand. We pair the geometric authority of **Manrope** with the clean, modern versatility of **Inter**.

*   **Display & Headlines (Manrope):** These are the "hero" elements. Use `display-lg` for vehicle names. The wider tracking and geometric shapes of Manrope convey a sense of modern engineering and power.
*   **Body & Labels (Inter):** These handle the information. Inter provides a neutral, sophisticated technical feel that balances the "loudness" of the gold headlines.
*   **Sophisticated Scale:** We utilize extreme contrast. A `display-lg` headline may sit near a `label-sm` technical spec, creating an editorial feel that emphasizes the "Legend" status of the brand.

## 4. Elevation & Depth
In "The Sovereign Gallery," we do not use "drop shadows" in the traditional sense. We use light and material.

### The Layering Principle
Depth is achieved by stacking surface tokens. 
*   **Low Importance:** `surface_container_lowest` (#0e0e0e).
*   **High Importance:** `surface_bright` (#393939).
By placing a "higher" surface on a "lower" background, we create a soft, natural lift that mimics architectural lighting.

### Ambient Shadows
If a floating effect is required for a modal or a primary vehicle card, shadows must be:
*   **Color:** Tonal (a 20% opacity version of `#000000`).
*   **Spec:** Large blur (40px-60px), 0px offset, 4-8% opacity. This creates an "atmospheric glow" rather than a "stuck-on" shadow.

### The "Ghost Border" Fallback
If accessibility requires a boundary, use a **Ghost Border**: the `outline_variant` token (#4d4635) at 15% opacity. Never use 100% opaque borders.

## 5. Components

### Buttons
*   **Primary:** A gradient-fill (`primary` to `primary_container`) with `on_primary` (#3c2f00) text. No border. Radius: `md` (0.375rem).
*   **Secondary:** `surface_container_highest` background with a `primary` Ghost Border.
*   **Tertiary:** Text-only in `primary`, with an arrow icon that shifts 4px on hover.

### Cards & Lists
*   **The "No-Divider" Rule:** Forbid the use of divider lines between list items or card sections. Use vertical whitespace (32px+) or a shift from `surface_container_low` to `surface_container_lowest` to denote new information clusters.
*   **Vehicle Brand Chips:** Unlike the reference image's boxed logos, use `surface_container_high` containers with the `xl` (0.75rem) roundedness for a softer, premium feel.

### Interactive Elements
*   **Input Fields:** Use `surface_container_lowest` as the field background. The label should be in `on_surface_variant` (#d0c5af). On focus, the bottom edge should illuminate with a 2px `primary` (gold) glow.
*   **Glass Badges:** For items like "Limited Edition" or "Special Offer," use a `surface_variant` background with 40% opacity and a heavy backdrop blur.

### Signature Component: The "Gallery Scroller"
Instead of a standard grid, vehicles should be presented in an asymmetrical horizontal scroller where the active vehicle is 20% larger than the others, creating a "spotlight" effect.

## 6. Do's and Don'ts

### Do
*   **Do** use high-quality, low-key photography (cars shot against dark backgrounds with rim lighting).
*   **Do** embrace negative space. If a section feels empty, it’s likely working; luxury is the luxury of space.
*   **Do** use `primary` (gold) sparingly. It is a highlighter, not a background color.
*   **Do** ensure all interactive states have a subtle "gold" glow or transition.

### Don't
*   **Don't** use pure white (#FFFFFF) for body text; use `on_surface` (#e5e2e1) to reduce eye strain and maintain the "dark gallery" mood.
*   **Don't** use standard 1px borders or "Material Design" style heavy cards.
*   **Don't** use bright, saturated colors for "Alerts" or "Success." Use the `error` (#ffb4ab) and `primary` (gold) tones to keep the palette sophisticated.
*   **Don't** use Calibri. It lacks the modern, architectural weight required for a luxury automotive brand. Stick strictly to the Manrope/Inter pairing.