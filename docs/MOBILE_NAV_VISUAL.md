# Mobile Navigation - Quick Visual Reference

## 📱 Layout Structure

```
┌─────────────────────────────────────┐
│  📱 Mobile Header (md:hidden)       │
│  ┌─────────────────────────────┐   │
│  │   🎓 ISPGram                 │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│                                     │
│                                     │
│         Main Content                │
│         (pb-24 on mobile)           │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  Footer (mb-16 on mobile)           │
│  🎓 De Anza ISP Education Week 🎉 │
├═════════════════════════════════════┤
│  🏠   📤   ❤️   🏆   👤           │ ← Bottom Nav
│  Home Submit Vote Results Profile   │   (Fixed, z-50)
└─────────────────────────────────────┘
```

## 🎨 Visual States

### Default State
```
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│  🏠  │  │  📤  │  │  ❤️  │  │  🏆  │  │  👤  │
│ Home │  │Submit│  │ Vote │  │Result│  │Profile│
└──────┘  └──────┘  └──────┘  └──────┘  └──────┘
Gray text, 70% opacity labels
```

### Active State (e.g., on Vote page)
```
┌──────┐  ┌──────┐  ┌──────────┐  ┌──────┐  ┌──────┐
│  🏠  │  │  📤  │  │    ❤️    │  │  🏆  │  │  👤  │
│ Home │  │Submit│  │   Vote   │  │Result│  │Profile│
└──────┘  └──────┘  └────●─────┘  └──────┘  └──────┘
                    ↑           ↑
         Gradient bubble  Sky dot
         Sky text, 100% opacity
         Scaled icon (110%)
```

### Tap Animation
```
Before:         During Tap:      After:
┌──────┐       ┌────┐           ┌──────┐
│  🏠  │  →    │ 🏠 │     →     │  🏠  │
│ Home │       │Home│           │ Home │
└──────┘       └────┘           └──────┘
  100%         Scale 95%          100%
              (spring back)
```

## 🎯 Interactive Zones

### Touch Targets (Min 44x44px)
```
┌────────────┐
│            │ ← Padding (safe zone)
│   ┌────┐   │
│   │ 🏠 │   │ ← Icon (24x24px)
│   └────┘   │
│    Home    │ ← Label (10px font)
│            │
└─────●──────┘ ← Active dot
   64px wide
```

## 🌈 Color Palette

### Gradient Accent Line (Top border)
```
Sky → Indigo → Sky
#f97316  #a855f7  #f97316
```

### Active Bubble Background
```
Gradient: from-orange-100 to-purple-50
#ffedd5 → #faf5ff
```

### Icons & Text
- **Active**: `text-orange-600` (#dc2626)
- **Inactive**: `text-gray-600` (#4b5563)
- **Hover**: `text-orange-500` (#f97316)

### Background
- **Backdrop**: `bg-white/80` (80% opacity)
- **Blur**: `backdrop-blur-xl`

## 📐 Spacing & Sizing

```
Navbar Height:
├─ Gradient line: 2px
├─ Padding top: 8px (py-2)
├─ Icon: 24px (h-6 w-6)
├─ Gap: 4px (gap-1)
├─ Label: ~12px
├─ Padding bottom: 8px (py-2)
└─ Safe area: 0-34px (device dependent)
Total: ~58px + safe area

Icon Properties:
├─ Size: 24x24px (h-6 w-6)
├─ Active scale: 110%
└─ Transition: 300ms

Labels:
├─ Font size: 10px
├─ Font weight: 600 (semibold)
├─ Active opacity: 100%
└─ Inactive opacity: 70%

Touch zones:
├─ Width: 64px minimum
├─ Height: 44px minimum
└─ Padding: 12px (px-3 py-2)
```

## 🔄 Animation Timings

```css
/* All transitions use cubic-bezier for smooth motion */

Icon Scale:
  - Duration: 300ms
  - Easing: ease (default)
  - Transform: scale(1) → scale(1.1)

Active Press:
  - Duration: instant
  - Easing: n/a
  - Transform: scale(1) → scale(0.95)

Label Opacity:
  - Duration: 300ms
  - Easing: ease
  - Opacity: 0.7 → 1.0

Background Bubble:
  - Duration: 300ms
  - Easing: ease
  - Opacity: 0 → 1.0
```

## 🎭 Responsive Behavior

### Desktop (≥768px)
```
✓ Top nav visible
✗ Mobile header hidden
✗ Bottom nav hidden
✓ Footer normal margin
```

### Mobile (<768px)
```
✗ Top nav hidden
✓ Mobile header visible
✓ Bottom nav visible
✓ Footer extra margin (mb-16)
```

## 🧩 Component Anatomy

```tsx
<MobileNav>
  └─ <nav> (fixed bottom, z-50, md:hidden)
      └─ Backdrop container
          ├─ Gradient accent line (absolute top)
          └─ Safe area wrapper
              └─ Flex container (justify-around)
                  ├─ NavItem 1 (Home)
                  ├─ NavItem 2 (Submit)
                  ├─ NavItem 3 (Vote)
                  ├─ NavItem 4 (Results)
                  └─ NavItem 5 (Profile/Sign In)
                      └─ Each NavItem:
                          ├─ Active bubble (conditional)
                          ├─ Icon container
                          │   └─ Icon (with scale)
                          ├─ Label text
                          └─ Active dot (conditional)
```

## 🎪 Z-Index Hierarchy

```
1000 - Modals/Dialogs
 100 - Dropdowns
  50 - Mobile Nav (fixed)     ← Our component
  50 - Desktop Nav (sticky)
  10 - Overlays
   1 - Content
   0 - Background
```

## 📱 Device-Specific Adaptations

### iPhone with Notch (Safe Area)
```
┌─────────────────────────────┐
│                             │
│  Content scrolls here       │
│                             │
├─────────────────────────────┤
│  Navigation Items           │
│  🏠  📤  ❤️  🏆  👤      │
├─────────────────────────────┤
│                             │ ← Safe area padding
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │    (34px on iPhone X+)
└─────────────────────────────┘
```

### Standard Android
```
┌─────────────────────────────┐
│                             │
│  Content scrolls here       │
│                             │
├─────────────────────────────┤
│  Navigation Items           │
│  🏠  📤  ❤️  🏆  👤      │
└─────────────────────────────┘
No additional safe area needed
```
