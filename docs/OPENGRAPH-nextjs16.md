## Next.js OpenGraph Image Setup

Next.js provides two main approaches for OpenGraph images:[1]

### Static File Convention (Simplest)

Place an image file named `opengraph-image.jpg`, `opengraph-image.png`, or `opengraph-image.jpeg` directly in your `/app` directory. Next.js automatically detects it and generates the proper meta tags - no additional configuration needed.[2][1]

```
app/
  layout.tsx
  opengraph-image.jpeg  ← Next.js auto-detects this
  page.tsx
```

### Dynamic Generation with Code

For programmatically generated images, create `opengraph-image.tsx`:[3][1]

```typescript
import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ fontSize: 48, background: 'white' }}>
        Your Content
      </div>
    ),
    { ...size }
  )
}
```

## Issues in Your Code

### 1. **Redundant Configuration**
Since you have `/app/opengraph-image.jpeg`, Next.js auto-detects it. Your explicit metadata configuration works but is redundant. You can simplify to:[1]

```typescript
export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  // OpenGraph image auto-detected from opengraph-image.jpeg
};
```

### 2. **URL Should Be Absolute**
OpenGraph images should use absolute URLs with your domain:[4]

```typescript
openGraph: {
  images: [
    {
      url: 'https://yourdomain.com/opengraph-image.jpeg', // Absolute URL
      width: 1200,
      height: 630,
    },
  ],
},
```

### 3. **CSS Class Typo**
Line has `bg-linear-to-br` - should be `bg-gradient-to-br`:

```typescript
className={`${fontVariables} font-sans antialiased bg-gradient-to-br ${siteConfig.theme.bgGradient} min-h-screen`}
```

### Recommended Approach

Either rely on the file convention alone (simplest) or use absolute URLs if configuring manually. The file convention approach is cleaner for static images.[7][1]

[1](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
[2](https://www.wisp.blog/blog/how-to-create-open-graph-images-in-nextjs)
[3](https://www.usestencil.com/blog/how-to-setup-opengraph-image-for-nextjs)
[4](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
[5](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
[6](https://stackoverflow.com/questions/78034312/where-to-put-open-graph-tags-in-nextjs)
[7](https://github.com/vercel/next.js/discussions/53566)
[8](https://makerkit.dev/blog/tutorials/dynamic-og-image)
[9](https://dev.to/danmugh/understand-open-graph-og-in-next-js-a-practical-guide-3ade)
[10](https://www.dhiwise.com/post/how-to-set-up-nextjs-open-graph-for-better-sharing)