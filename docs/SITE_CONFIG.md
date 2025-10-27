# Site Configuration Management System

## Overview

ISPGram uses a centralized configuration system located in `config/siteConfig.ts` to manage all site-wide content, navigation, branding, and theming. This approach ensures consistency across the application and makes it easy to update content in one place.

## Configuration Structure

### Basic Site Information

```typescript
{
  name: 'ISPGram',
  title: 'ISPGram - De Anza ISP Education Week Activity',
  description: 'Full site description for SEO and metadata',
  shortDescription: 'Brief one-liner description'
}
```

**Usage:**
- `name`: Used in navigation headers and branding
- `title`: Applied to page metadata (SEO)
- `description`: Used in meta tags for search engines
- `shortDescription`: Used in compact displays

### Navigation

```typescript
navigation: [
  { href: '/submit', label: 'Submit' },
  { href: '/vote', label: 'Vote' },
  { href: '/results', label: 'Results' },
]
```

**Used in:**
- Desktop navigation (`app/layout.tsx`)
- Mobile bottom navigation (`components/mobile-nav.tsx`)

### Hero Section

```typescript
hero: {
  emoji: ['🎓', '📚'],
  icon: GraduationCap,
  title: 'ISPGram',
  subtitle: 'De Anza ISP Education Week Activity',
  description: 'Main description text...',
  ctaButtons: [
    {
      href: '/submit',
      label: 'Participate',
      icon: Upload,
      variant: 'primary',
    },
    // ...
  ],
}
```

**Used in:**
- Home page hero section (`app/page.tsx`)
- Navigation logo icon (`app/layout.tsx`)

### Activity Highlights

```typescript
activityHighlights: {
  title: 'Activity Highlights',
  icon: Trophy,
  items: [
    {
      label: 'Who can participate:',
      description: 'De Anza College ISP students...',
    },
    // ...
  ],
}
```

**Used in:**
- Home page highlights section (`app/page.tsx`)

### Features

```typescript
features: [
  {
    icon: Upload,
    title: 'Easy Sharing',
    description: 'Feature description...',
    color: 'text-sky-600',
  },
  // ...
]
```

**Used in:**
- Home page features grid (`app/page.tsx`)
- Mobile navigation icon mapping (`components/mobile-nav.tsx`)

### Theme Colors

```typescript
theme: {
  primary: 'sky-600',
  secondary: 'indigo-600',
  accent: 'amber-500',
  gradient: 'from-sky-600 via-indigo-600 to-sky-600',
  bgGradient: 'from-sky-50 via-indigo-50 to-slate-50',
}
```

**Used in:**
- All components for consistent color theming
- Background gradients
- Button styles
- Navigation elements

### Footer

```typescript
footer: {
  text: 'Presented by the De Anza ISP Office...',
}
```

**Used in:**
- Footer section (`app/layout.tsx`)

## How to Update Content

### Changing Site Name or Branding

Edit `config/siteConfig.ts`:

```typescript
export const siteConfig = {
  name: 'Your New Name',
  title: 'Your New Title - Description',
  // ...
}
```

Changes will automatically reflect in:
- Browser title bar
- Navigation headers (desktop & mobile)
- All branding elements

### Adding/Removing Navigation Links

Edit the `navigation` array:

```typescript
navigation: [
  { href: '/new-page', label: 'New Page' },
  // ...
]
```

The link will appear in:
- Desktop top navigation
- Mobile bottom navigation (with automatic icon mapping)

### Updating Homepage Content

All homepage text is centralized:

```typescript
hero: {
  title: 'New Hero Title',
  subtitle: 'New Subtitle',
  description: 'Updated description...',
}
```

### Changing Color Scheme

Update the theme object:

```typescript
theme: {
  primary: 'blue-600',      // Main brand color
  secondary: 'purple-600',  // Secondary brand color
  accent: 'yellow-500',     // Accent color
  gradient: 'from-blue-600 via-purple-600 to-blue-600',
  bgGradient: 'from-blue-50 via-purple-50 to-slate-50',
}
```

## Benefits of This System

1. **Single Source of Truth**: All content lives in one file
2. **Type Safety**: TypeScript ensures configuration correctness
3. **Easy Maintenance**: Update once, changes reflect everywhere
4. **Consistency**: Ensures uniform branding across the app
5. **DRY Principle**: No duplicate content across components

## Files Using Configuration

- `app/layout.tsx` - Metadata, navigation, footer
- `app/page.tsx` - Hero, features, highlights
- `components/mobile-nav.tsx` - Mobile navigation

## Best Practices

1. **Always import from config**: Don't hardcode content in components
2. **Use TypeScript types**: Ensure type safety for all config values
3. **Document changes**: Note what each field affects
4. **Test thoroughly**: Changes affect multiple pages
5. **Keep it organized**: Group related configuration together

## Example: Adding a New Feature

1. Add feature to config:

```typescript
features: [
  // existing features...
  {
    icon: Star,
    title: 'New Feature',
    description: 'Feature description',
    color: 'text-green-600',
  },
]
```

2. Import icon at the top:

```typescript
import { Star } from "lucide-react";
```

3. The feature will automatically appear on the homepage features grid.

## Troubleshooting

**Problem**: Changes not reflecting
- Solution: Check if component is importing from `@/config/siteConfig`
- Solution: Restart dev server to clear cache

**Problem**: TypeScript errors
- Solution: Ensure all required fields are present in config
- Solution: Check that icon imports are correct

**Problem**: Tailwind classes not working
- Solution: Use full class names (e.g., `text-sky-600`, not `text-${variable}`)
- Solution: For dynamic colors, ensure classes are in Tailwind's safelist

