# NSFW Content Filter

## Overview
ISPGram uses TensorFlow.js and the `nsfwjs` library to automatically detect and block inappropriate images before they are uploaded to the platform.

## How It Works

### Detection Process
1. **Image Upload**: User selects an image in the submit form
2. **Client Validation**: File type (JPEG/PNG) and size (max 5MB) checked first
3. **Server Processing**: Image is sent to `/api/upload` endpoint
4. **NSFW Analysis**: TensorFlow.js model analyzes the image
5. **Decision**: Image is either accepted or rejected based on confidence scores
6. **Upload**: Only approved images are stored in Vercel Blob

### Classification Categories
The model classifies images into 5 categories:
- **Drawing** - Illustrations, cartoons, sketches
- **Neutral** - Safe content, everyday photos
- **Sexy** - Suggestive but not explicit content
- **Porn** - Explicit adult content
- **Hentai** - Explicit animated/illustrated content

### Blocking Rules
Images are **blocked** if:
- Category is `Porn`, `Sexy`, or `Hentai`
- Confidence level is above **60%** threshold

Images are **approved** if:
- Category is `Drawing` or `Neutral`
- OR confidence is below the threshold

## Technical Implementation

### Files
- `/lib/nsfw-filter.ts` - Core NSFW detection logic
- `/app/api/upload/route.ts` - Integration in upload endpoint

### Model Loading
- Model is lazy-loaded on first upload request
- Cached in memory for subsequent requests
- First upload may take 2-3 seconds longer due to model initialization

### Error Handling
- **Detection Errors**: If NSFW analysis fails, upload is rejected for safety
- **User Feedback**: Clear error messages explain why images are blocked
- **Logging**: All results (approved/rejected) are logged for monitoring

## Configuration

### Adjusting Threshold
To change the sensitivity, edit the threshold in `/lib/nsfw-filter.ts`:

```typescript
const NSFW_THRESHOLD = 0.6 // 60% confidence (default)
// Lower = more strict (blocks more images)
// Higher = more lenient (blocks fewer images)
```

### Modifying Blocked Categories
To change which categories are blocked, edit in `/lib/nsfw-filter.ts`:

```typescript
const NSFW_CATEGORIES = ['Porn', 'Sexy', 'Hentai']
// Add or remove categories as needed
```

## Monitoring

### Logs
Check server logs for NSFW detection results:

```
✅ Image approved for user [userId]: { category: 'Neutral', confidence: 98 }
⚠️ NSFW image blocked for user [userId]: { category: 'Sexy', confidence: 87 }
```

### False Positives
If legitimate images are being blocked:
1. Check the logs for confidence scores
2. Consider raising the threshold (e.g., 0.7 or 0.75)
3. Review the specific category causing blocks

### False Negatives
If inappropriate images get through:
1. Lower the threshold (e.g., 0.5 or 0.4)
2. Add additional categories to the blocked list
3. Consider manual review processes

## Performance

### Model Size
- NSFWJS model: ~73MB
- Downloads on first server startup
- Cached in memory after first load

### Processing Time
- Analysis: ~500ms - 2s per image (depends on image size)
- First request: +2-3s for model loading
- Subsequent requests: Normal speed

### Memory Usage
- Model uses ~100-200MB RAM when loaded
- Tensors are properly disposed to prevent memory leaks
- Safe for production use with moderate traffic

## Dependencies
```json
{
  "@tensorflow/tfjs": "^4.22.0",
  "nsfwjs": "^4.2.1",
  "canvas": "^3.2.0"
}
```

**Note**: We use the browser-compatible TensorFlow.js with the `canvas` package for server-side image processing, avoiding the native bindings that cause build issues with Next.js.

## Limitations
1. **Not 100% Accurate**: AI models can make mistakes
2. **Context Blind**: Doesn't understand artistic or educational context
3. **Edge Cases**: May struggle with heavily edited or stylized images
4. **Language**: Model trained on general internet images, may have biases

## Recommendations
1. **Combine with Reporting**: Allow users to report inappropriate content
2. **Manual Review**: Consider manual review for edge cases
3. **Clear Guidelines**: Provide clear community guidelines to users
4. **Appeal Process**: Allow users to appeal blocked uploads
5. **Regular Monitoring**: Review logs weekly to check for patterns

## Testing
To test the NSFW filter:
1. Use test images from the NSFW dataset
2. Check server logs for classification results
3. Verify appropriate images are approved
4. Verify inappropriate images are blocked

## Privacy
- Images are analyzed in-memory only
- No image data is sent to external services
- Analysis happens on your server
- NSFW detection is completely private

## Resources
- [nsfwjs Documentation](https://github.com/infinitered/nsfwjs)
- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [Model Details](https://github.com/GantMan/nsfw_model)
