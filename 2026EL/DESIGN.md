---
name: Lingdong Jinling (灵动金陵)
colors:
  surface: '#fdfae7'
  surface-dim: '#dddbc8'
  surface-bright: '#fdfae7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f4e1'
  surface-container: '#f1eedb'
  surface-container-high: '#ece9d6'
  surface-container-highest: '#e6e3d0'
  on-surface: '#1c1c11'
  on-surface-variant: '#55423e'
  inverse-surface: '#313124'
  inverse-on-surface: '#f4f1de'
  outline: '#88726d'
  outline-variant: '#dbc1ba'
  surface-tint: '#9a442d'
  primary: '#9a442d'
  on-primary: '#ffffff'
  primary-container: '#e07a5f'
  on-primary-container: '#5b1604'
  inverse-primary: '#ffb4a1'
  secondary: '#5a5c79'
  on-secondary: '#ffffff'
  secondary-container: '#dcddff'
  on-secondary-container: '#5e617d'
  tertiary: '#386753'
  on-tertiary: '#ffffff'
  tertiary-container: '#70a18a'
  on-tertiary-container: '#003725'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd2'
  primary-fixed-dim: '#ffb4a1'
  on-primary-fixed: '#3c0800'
  on-primary-fixed-variant: '#7c2e19'
  secondary-fixed: '#dfe0ff'
  secondary-fixed-dim: '#c2c4e5'
  on-secondary-fixed: '#161a32'
  on-secondary-fixed-variant: '#424560'
  tertiary-fixed: '#bbeed4'
  tertiary-fixed-dim: '#9fd1b8'
  on-tertiary-fixed: '#002115'
  on-tertiary-fixed-variant: '#1f4f3c'
  background: '#fdfae7'
  on-background: '#1c1c11'
  surface-variant: '#e6e3d0'
  sunset-orange: '#E07A5F'
  deep-sea-blue: '#3D405B'
  sage-green: '#81B29A'
  wheat-yellow: '#F2CC8F'
  ancient-wall: '#F4F1DE'
  relief-gold: '#D4AF37'
typography:
  headline-display:
    fontFamily: Epilogue
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Epilogue
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  title-md:
    fontFamily: Epilogue
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Source Sans 3
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system embodies **"Atmospheric Utility,"** a fusion of historical romance and modern travel guidance. It targets Gen-Z explorers and students in Nanjing, evoking a sense of nostalgia, cultural curiosity, and painterly beauty. 

The style is a sophisticated **Eclectic Art Nouveau**:
- **Basque Influence:** Visual weight is grounded in tactile, stone-like textures and handcrafted ceramic finishes, reflecting the enduring nature of Nanjing's city walls.
- **Mucha (Art Nouveau):** Verticality, intricate botanical framing (Ginkgo and Plum blossoms), and flowing decorative lines guide the user's eye and organize information.
- **Impressionism:** Light is treated as a dynamic element. Backgrounds utilize soft, dappled light patterns and grainy, "painterly" blurs to create depth without clinical precision.

The interface should feel like an interactive vintage travel log or a "Script Kill" (剧本杀) invitation—handcrafted, artistic, and deeply humanistic.

## Colors
The palette is derived from the "Twilight Qinhuai" and "Sycamore Green" themes. 

- **Primary (Sunset Orange):** Used for key interactive actions, branding, and energetic highlights.
- **Secondary (Deep Sea Blue):** Provides structural weight, used for text, heavy borders, and evening-themed UI states.
- **Tertiary (Sage Green):** Represents nature and tranquility, used for "Life" category tags and success states.
- **Background (Ancient Wall):** A cream-white base that mimics aged rice paper or weathered stone, providing a warm, low-strain canvas for reading.
- **Named Color (Relief Gold):** Specifically reserved for botanical frames and decorative relief elements to signify premium content or "Unlocked" achievements.

The color mode is locked to a **Warm Light Mode** by default, shifting to a "Moonlit" variant (using Deep Sea Blue as the base) during evening hours.

## Typography
Typography is a dialogue between **Basque-inspired Serif aesthetics** and **Utilitarian Sans-serif clarity**.

- **Headlines (Epilogue):** Chosen for its geometric but distinctive character that mimics the rhythmic weight of Artistic Songti (艺术宋体). Use these for route titles, "Mood" headers, and historical milestones.
- **Body (Source Sans 3):** A reliable, high-legibility font for long-form descriptions and narrative dialogue. 
- **Labels (Work Sans):** Used for metadata, button text, and navigation labels to ensure clarity against decorative backgrounds.

For Chinese text, utilize **Source Han Sans (思源黑体)** for body and **Artistic Songti** for display, ensuring the decorative stems of the Songti complement the Epilogue English headers.

## Layout & Spacing
The layout follows a **Vertical Long-form Composition**, inspired by Art Nouveau posters.

- **Grid:** A 12-column fluid grid for desktop and a 4-column grid for mobile.
- **Decorative Margins:** Mobile layouts use a generous 20px margin, often occupied by "Botanical Relief" borders that grow and shrink during scroll.
- **Mood Compass Placement:** The central interaction point (Mood Compass) is anchored to the bottom-center of the screen, acting as a floating ergonomic hub.
- **Content Blocks:** Use "Story Cards" that stack vertically with a 16px gutter, mimicking a sequence of physical cards or invitations.

## Elevation & Depth
Depth is not achieved through standard drop shadows, but through **Tonal Layering and Material Texture**:

1.  **Texture Stacking:** The base layer is the "Ancient Wall" paper texture. Cards sit atop this with a subtle "Coarse Pottery" inner shadow to suggest they are carved into or pressed onto the surface.
2.  **Impressionist Glassmorphism:** Modals and overlays use a frosted glass effect with an added "film grain." This allows the vibrant colors of the Nanjing sunset to bleed through the UI without sacrificing legibility.
3.  **Gilded Relief:** Interactive elements like the "Mood Compass" or "Unlocked Achievements" use a 1px Gold Relief border, creating a tactile "metallic ink" effect that feels elevated above the paper base.

## Shapes
Shapes are **Organic and Asymmetrical**, avoiding perfect circles or squares where possible.

- **Cards:** Use "Rounded" (0.5rem) corners, but often feature one "irregular" corner or a decorative botanical cutout.
- **The Mood Compass:** A perfect circle, but its internal indicators are organic "Brushstroke" shapes.
- **Dividers:** Instead of lines, use horizontal "Scent Patches"—soft-edged color blocks that fade into the background.

## Components
Consistent styling across the app's unique interactive elements:

- **Buttons:** Styled with a "Unglazed Pottery" micro-texture. They should feel slightly "squishy" or tactile when pressed, using a subtle scale-down animation to mimic physical touch.
- **Story Cards:** Feature "Golden Relief" borders. High-priority cards (like the "Nanjing University History Line") use an intricate Ginkgo leaf frame.
- **The Mood Compass:** A rotating wheel with haptic feedback. As the user rotates the dial to select "Time" or "Budget," the botanical borders of the app "grow" (animate) in response.
- **Mood Tags/Chips:** Soft-edged, watercolor-style patches. When selected, they transition from a desaturated "Ancient Wall" grey to a vibrant "Sunset Orange" or "Sage Green."
- **Input Fields:** Minimalist lines with a "Brushstroke" underline that animates from left to right as the user types.
- **Achievement Cards:** Mini "Oil Paintings" that, when collected, tile together to form a seamless Jinling scroll in the user's profile.