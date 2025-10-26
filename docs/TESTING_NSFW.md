# Testing NSFW Filter

## Quick Test Guide

### 1. Start Development Server
```bash
pnpm dev
```

### 2. Navigate to Submit Page
Open `http://localhost:3000/submit` in your browser

### 3. Test Scenarios

#### ✅ Test 1: Safe Image (Should Pass)
1. Upload a normal photo (landscape, food, object, etc.)
2. Check browser console and server logs
3. Expected: Image uploads successfully
4. Server log should show: `Image approved for user [userId]: { category: 'Neutral', confidence: XX }`

#### ❌ Test 2: Inappropriate Image (Should Block)
1. Upload an inappropriate image (use test images from NSFW datasets)
2. Expected: Error message appears
3. Error should say: "This image contains inappropriate content..."
4. Server log should show: `NSFW image blocked for user [userId]: { category: 'XXX', confidence: XX }`

#### ⚠️ Test 3: Edge Cases
- **Very Small Images**: Test with tiny images (< 100px)
- **Very Large Images**: Test with images near 5MB limit
- **Different Formats**: Test JPEG, PNG, JPG
- **Corrupted Files**: Test with invalid/corrupted image data

## Monitoring Server Logs

### Approved Images
```bash
Image approved for user clk_2abcd1234: {
  category: 'Neutral',
  confidence: 98
}
```

### Blocked Images
```bash
NSFW image blocked for user clk_2abcd1234: {
  category: 'Sexy',
  confidence: 87
}
```

### Error Messages
```bash
NSFW detection failed: [Error details]
```

## Testing with cURL

### Test Upload Endpoint Directly
```bash
# First, get your auth token from browser (Clerk session)
# Then test upload:

curl -X POST http://localhost:3000/api/upload \
  -H "Cookie: __session=YOUR_SESSION_COOKIE" \
  -F "file=@/path/to/test-image.jpg"
```

### Expected Responses

#### Safe Image Response (200)
```json
{
  "url": "https://va6iw0qi88gfmfrc.public.blob.vercel-storage.com/education-week/clk_123-1234567890.jpg"
}
```

#### Blocked Image Response (400)
```json
{
  "error": "This image contains inappropriate content and cannot be uploaded. Please choose a different photo that follows our community guidelines.",
  "details": {
    "category": "Sexy",
    "confidence": 87
  }
}
```

#### Detection Error Response (500)
```json
{
  "error": "Unable to verify image content. Please try again or contact support."
}
```

## Adjusting for Testing

### Temporarily Lower Threshold (More Strict)
In `/lib/nsfw-filter.ts`:
```typescript
const NSFW_THRESHOLD = 0.4 // Very strict - blocks more images
```

### Temporarily Raise Threshold (More Lenient)
```typescript
const NSFW_THRESHOLD = 0.8 // Very lenient - blocks fewer images
```

### Test All Categories
```typescript
// Block ONLY porn (for testing)
const NSFW_CATEGORIES = ['Porn']

// Block everything except neutral (very strict)
const NSFW_CATEGORIES = ['Porn', 'Sexy', 'Hentai', 'Drawing']
```

## Performance Testing

### Measure Model Loading Time
```bash
# First upload after server restart
time curl -X POST ... # Should be 2-3 seconds longer

# Second upload (model cached)
time curl -X POST ... # Should be normal speed (~500ms-1s)
```

### Check Memory Usage
```bash
# Monitor Node.js memory
node --expose-gc server.js
```

## Test Images Sources

### Safe Test Images
- Use placeholder services: `https://picsum.photos/500`
- Your own photos (landscapes, food, objects)
- Stock photos from Unsplash, Pexels

### NSFW Test Images (For Verification)
- Use the official NSFW dataset: [NSFW Data Science Repo](https://github.com/alex000kim/nsfw_data_scraper)
- **DO NOT** use real inappropriate content
- Use validated test sets with known classifications

## Debugging Tips

### 1. Model Not Loading
```bash
# Check if model files are cached
ls node_modules/nsfwjs/

# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
```

### 2. Canvas Issues
```bash
# Verify canvas is installed correctly
pnpm ls canvas

# Reinstall canvas
pnpm remove canvas
pnpm add canvas
```

### 3. TensorFlow Warnings
```bash
# Normal warnings (can be ignored):
# - Platform-specific optimizations
# - Backend selection messages
```

### 4. False Positives/Negatives
```bash
# Enable detailed logging in /lib/nsfw-filter.ts
console.log('Full predictions:', predictions)

# Check all categories and their confidence scores
predictions.forEach(pred => {
  console.log(`${pred.className}: ${(pred.probability * 100).toFixed(2)}%`)
})
```

## Automated Testing (Future)

### Unit Test Example
```typescript
// __tests__/nsfw-filter.test.ts
import { checkNSFW } from '@/lib/nsfw-filter'
import fs from 'fs'

describe('NSFW Filter', () => {
  it('should approve safe images', async () => {
    const buffer = fs.readFileSync('./test-images/safe.jpg')
    const result = await checkNSFW(buffer)
    expect(result.isNSFW).toBe(false)
  })

  it('should block inappropriate images', async () => {
    const buffer = fs.readFileSync('./test-images/nsfw.jpg')
    const result = await checkNSFW(buffer)
    expect(result.isNSFW).toBe(true)
  })
})
```

## Production Checklist

Before deploying to production:

- [ ] Test with at least 10 safe images
- [ ] Test with at least 5 edge cases
- [ ] Verify error messages are user-friendly
- [ ] Check server logs are properly formatted
- [ ] Confirm model loads on first request
- [ ] Test on production environment (Vercel/similar)
- [ ] Monitor memory usage under load
- [ ] Set up alerts for high block rates
- [ ] Document threshold in team wiki
- [ ] Create user guidelines for acceptable content

## Troubleshooting Common Issues

### "Cannot find module 'canvas'"
```bash
pnpm add canvas
pnpm approve-builds canvas
```

### "Model failed to load"
```bash
# Check internet connection (model downloads on first use)
# Or cache the model locally in /public/nsfw-model/
```

### "Out of memory errors"
```bash
# Increase Node.js memory limit
NODE_OPTIONS=--max-old-space-size=4096 pnpm dev
```

### "All images being blocked"
```bash
# Threshold too low - increase to 0.7
const NSFW_THRESHOLD = 0.7
```

### "Inappropriate images passing through"
```bash
# Threshold too high - decrease to 0.5
const NSFW_THRESHOLD = 0.5
```

## Monitoring in Production

### Set Up Logging Service
```typescript
// Example with a logging service
import { logEvent } from '@/lib/analytics'

if (nsfwResult.isNSFW) {
  logEvent('nsfw_blocked', {
    category: nsfwResult.details.category,
    confidence: nsfwResult.details.confidence,
    userId: userId,
    timestamp: new Date().toISOString(),
  })
}
```

### Weekly Review Checklist
1. Check total uploads vs blocked uploads ratio
2. Review blocked categories distribution
3. Check for unusual patterns (same user, same category)
4. Adjust threshold if needed based on data
5. Update user guidelines if specific issues emerge

---

**Happy Testing!** 🧪

If you encounter any issues, check `/docs/NSFW_FILTER.md` for detailed documentation.
