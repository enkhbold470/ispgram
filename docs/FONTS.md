# Font Configuration Guide

## Current Setup (2025)

This project uses **Geist** and **Geist Mono** fonts from Vercel - the most modern and clean font family for web applications in 2025.

### Why Geist?
- **Modern & Clean**: Released by Vercel, designed specifically for modern web interfaces
- **Excellent Readability**: Optimized for digital screens with perfect letter spacing
- **Variable Font**: Smooth weight transitions for better typography
- **Performance**: Optimized with font-display: swap for fast loading

## How to Change Fonts

All font configuration is centralized in `/lib/fonts.ts`. Here's how to switch fonts:

### Option 1: Use Google Fonts

```typescript
// lib/fonts.ts
import { Inter, JetBrains_Mono } from "next/font/google";

export const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});
```

### Option 2: Use Local Custom Fonts

```typescript
// lib/fonts.ts
import localFont from "next/font/local";

export const fontSans = localFont({
  src: [
    {
      path: "../public/fonts/CustomFont-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/CustomFont-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});
```

## Popular Modern Fonts (2025)

### For Body Text:
- **Geist** (current) - Clean, modern, Vercel's font
- **Inter** - Professional, widely adopted
- **Manrope** - Friendly, rounded
- **Plus Jakarta Sans** - Modern, geometric
- **Instrument Sans** - Editorial, sophisticated
- **Space Grotesk** - Tech-forward, distinctive

### For Headings (if you want different):
- **Cal Sans** - Bold, impactful
- **Clash Display** - Geometric, modern
- **Sora** - Tech-focused
- **Outfit** - Clean, geometric

### For Monospace/Code:
- **Geist Mono** (current) - Matches Geist perfectly
- **JetBrains Mono** - Developer favorite
- **Fira Code** - With ligatures
- **IBM Plex Mono** - Professional

## How It Works

1. **Font Definition** (`/lib/fonts.ts`):
   - Imports fonts from Next.js font loader
   - Creates CSS variables (`--font-sans`, `--font-mono`)
   - Exports combined variables

2. **Application** (`/app/layout.tsx`):
   - Imports `fontVariables` from lib/fonts
   - Applies to `<body>` className
   - Uses `font-sans` utility class for default font

3. **Global Styles** (`/app/globals.css`):
   - Maps CSS variables to Tailwind utilities
   - Provides fallback font stacks

## Usage in Components

The default font is automatically applied. For specific usage:

```tsx
// Use sans-serif font (default)
<div className="font-sans">Regular text</div>

// Use monospace font
<code className="font-mono">const code = true;</code>

// Font weights
<h1 className="font-bold">Bold Heading</h1>
<p className="font-medium">Medium text</p>
<p className="font-light">Light text</p>
```

## Best Practices

1. **Always use swap**: Prevents layout shift during font loading
2. **Subset languages**: Only load character sets you need
3. **Limit weights**: Only include weights you actually use
4. **Test loading**: Check performance with slow 3G throttling
5. **Fallback fonts**: Always provide system font fallbacks

## Performance Tips

- **Preload fonts**: Next.js automatically preloads fonts defined with next/font
- **Self-hosting**: next/font/google automatically self-hosts Google Fonts
- **Variable fonts**: Use variable fonts when possible for better performance
- **Font display**: Use 'swap' for better perceived performance

## Resources

- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Google Fonts](https://fonts.google.com/)
- [Fontsource](https://fontsource.org/) - NPM fonts
- [Vercel's Geist](https://vercel.com/font)
