# ISPGram Centralized Color System

## Overview
All colors in ISPGram are now centralized in `/app/globals.css` using CSS custom properties. This ensures consistency across the application and makes it easy to update the theme.

## Color Tokens

### Theme Colors (Education Week Branding)
```css
--theme-primary: hsl(200 98% 39%)           /* sky-600 - Primary action color */
--theme-primary-hover: hsl(200 98% 35%)     /* sky-700 - Hover state */
--theme-primary-light: hsl(204 94% 94%)     /* sky-50 - Light backgrounds */

--theme-secondary: hsl(239 84% 67%)         /* indigo-600 - Secondary actions */
--theme-secondary-hover: hsl(239 84% 60%)   /* indigo-700 - Hover state */
--theme-secondary-light: hsl(239 100% 97%)  /* indigo-50 - Light backgrounds */

--theme-accent: hsl(26 90% 55%)             /* orange-500 - Accent color */
--theme-accent-hover: hsl(26 90% 48%)       /* orange-600 - Hover state */
--theme-accent-light: hsl(33 100% 96%)      /* orange-50 - Light backgrounds */
--theme-accent-border: hsl(24 100% 93%)     /* orange-100 - Borders */
--theme-accent-muted: hsl(24 100% 85%)      /* orange-200 - Subtle accents */

--theme-tertiary: hsl(271 91% 65%)          /* purple-500 - Tertiary color */
--theme-tertiary-light: hsl(270 100% 98%)   /* purple-50 - Light backgrounds */
```

### Rank/Medal Colors
```css
--rank-gold: hsl(45 93% 58%)     /* yellow-400 - 1st place */
--rank-silver: hsl(0 0% 73%)     /* gray-400 - 2nd place */
--rank-bronze: hsl(33 90% 62%)   /* orange-400 - 3rd place */
```

### Semantic Colors
```css
--success: hsl(142 76% 36%)          /* green-600 - Success states */
--success-light: hsl(138 76% 97%)    /* green-50 - Success backgrounds */

--warning: hsl(26 90% 55%)           /* orange-500 - Warning states */
--warning-light: hsl(33 100% 96%)    /* orange-50 - Warning backgrounds */

--info: hsl(200 98% 39%)             /* sky-600 - Info states */
--info-light: hsl(204 94% 94%)       /* sky-50 - Info backgrounds */

--error: hsl(0 84% 60%)              /* red-500 - Error states */
--error-light: hsl(0 86% 97%)        /* red-50 - Error backgrounds */
```

### Vote/Like Colors
```css
--vote-active: hsl(0 84% 60%)              /* red-500 - Active vote */
--vote-active-shadow: hsl(0 84% 60% / 0.5) /* Shadow for active state */
--vote-inactive: hsl(0 0% 96%)             /* gray-100 - Inactive vote */
--vote-inactive-hover: hsl(0 0% 90%)       /* gray-200 - Hover state */
```

### Gray Scale
```css
--gray-50: hsl(0 0% 98%)
--gray-100: hsl(0 0% 96%)
--gray-200: hsl(0 0% 90%)
--gray-300: hsl(0 0% 83%)
--gray-400: hsl(0 0% 73%)
--gray-500: hsl(0 0% 62%)
--gray-600: hsl(0 0% 45%)
--gray-700: hsl(0 0% 38%)
--gray-800: hsl(0 0% 15%)
--gray-900: hsl(0 0% 9%)
```

## Usage in Tailwind Classes

### Using Theme Colors
```jsx
// Primary action button
<button className="bg-theme-primary hover:bg-theme-primary-hover text-white">
  Submit Entry
</button>

// Secondary button
<button className="border-2 border-theme-secondary text-theme-secondary hover:bg-theme-secondary-light">
  View Results
</button>

// Accent elements (mobile nav, profile)
<div className="border-theme-accent-border bg-theme-accent-light">
  Navigation Item
</div>
```

### Using Rank Colors
```jsx
// Medal borders for entry cards
<div className="border-[var(--rank-gold)] ring-2 ring-[var(--rank-gold)]">
  1st Place Entry
</div>

<div className="border-[var(--rank-silver)] ring-2 ring-[var(--rank-silver)]">
  2nd Place Entry
</div>

<div className="border-[var(--rank-bronze)] ring-2 ring-[var(--rank-bronze)]">
  3rd Place Entry
</div>
```

### Using Semantic Colors
```jsx
// Success message
<div className="bg-success-light text-success">
  <CheckCircle className="text-success" />
  Entry submitted successfully!
</div>

// Error message
<div className="bg-error-light text-error">
  <AlertCircle className="text-error" />
  Failed to upload image
</div>
```

### Using Vote Colors
```jsx
// Vote button
<button className={voted 
  ? "bg-vote-active text-white shadow-[...]" 
  : "bg-vote-inactive text-gray-700 hover:bg-vote-inactive-hover"
}>
  <Heart className={voted && "fill-current"} />
  {voteCount}
</button>
```

## Custom Gradients

### Background Gradients
The project uses custom gradient utilities defined in Tailwind:
```jsx
// Primary gradient (sky to indigo)
<div className="bg-linear-to-r from-theme-primary to-theme-secondary">
  Gradient Background
</div>

// Accent gradient (orange to purple)
<div className="bg-linear-to-br from-theme-accent to-theme-tertiary">
  Accent Gradient
</div>
```

## Component Examples

### Entry Card
- **1st place**: `border-[var(--rank-gold)] ring-2 ring-[var(--rank-gold)]`
- **2nd place**: `border-[var(--rank-silver)] ring-2 ring-[var(--rank-silver)]`
- **3rd place**: `border-[var(--rank-bronze)] ring-2 ring-[var(--rank-bronze)]`

### Vote Button
- **Active**: `bg-vote-active text-white`
- **Inactive**: `bg-vote-inactive text-gray-700 hover:bg-vote-inactive-hover`

### Mobile Navigation
- **Active state**: `text-theme-accent bg-linear-to-br from-theme-accent-light to-theme-tertiary-light`
- **Inactive**: `text-gray-600 hover:text-theme-accent-hover`
- **Border**: `border-theme-accent-border`
- **Gradient accent**: `bg-linear-to-r from-theme-accent via-theme-tertiary to-theme-accent`

### Profile Page
- **Card border**: `border-theme-accent-border`
- **Header background**: `from-theme-accent-light via-theme-tertiary-light to-theme-accent-light`
- **Avatar ring**: `ring-theme-accent-muted`
- **Avatar fallback**: `from-theme-accent to-theme-tertiary`

## Benefits of Centralization

1. **Consistency**: All colors are defined in one place
2. **Easy Updates**: Change theme colors by editing CSS variables
3. **Type Safety**: Tailwind autocomplete works with custom properties
4. **Maintenance**: No scattered hardcoded color values
5. **Scalability**: Easy to add new theme variations or dark mode
6. **Performance**: CSS custom properties are efficient

## Updating Colors

To change the theme:

1. **Edit `/app/globals.css`**: Modify the HSL values in the `:root` selector
2. **No code changes needed**: All components automatically use the updated values
3. **Test**: Verify colors across all pages (Submit, Vote, Results, Profile)

Example theme update:
```css
/* Change primary from sky-600 to blue-600 */
--theme-primary: hsl(217 91% 60%);  /* blue-600 */
--theme-primary-hover: hsl(217 91% 54%);  /* blue-700 */
```

## Migration Notes

All hardcoded colors have been replaced with theme tokens:
- ✅ `text-sky-600` → `text-theme-primary`
- ✅ `bg-orange-500` → `bg-theme-accent`
- ✅ `border-yellow-400` → `border-[var(--rank-gold)]`
- ✅ `text-red-500` → `text-error`
- ✅ Template literals removed from all components

## Dark Mode Support (Future)

The centralized system is ready for dark mode:
```css
.dark {
  --theme-primary: hsl(200 98% 60%);  /* Lighter shade for dark bg */
  --theme-primary-hover: hsl(200 98% 65%);
  /* ... etc */
}
```

All components will automatically adapt when dark mode is enabled.
