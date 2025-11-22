# Image Re-compression Migration Script

## Overview

This script allows you to re-compress existing images that were uploaded before compression was implemented. It's **completely optional** - your existing images will continue to work fine, they just might be larger files.

## ⚠️ Important Notes

- **No data loss**: Existing images are safe and will continue to work
- **Optional**: You don't need to run this script - it's only for optimization
- **Backup recommended**: While the script is safe, consider backing up your database before running
- **Time-consuming**: Processing many images can take a while

## What the Script Does

1. Fetches all entries from your database
2. Downloads each image from Vercel Blob
3. Re-compresses it using Sharp (same compression as new uploads)
4. Uploads the compressed version back to Vercel Blob
5. Updates the database with the new compressed image URL
6. Keeps the old image (doesn't delete it automatically)

## Prerequisites

1. **BLOB_READ_WRITE_TOKEN** environment variable must be set
   - Get it from: https://vercel.com/dashboard/stores
   - Add it to your `.env` file

2. Database must be accessible (DATABASE_URL in `.env`)

## Usage

1. Make sure your `.env` file has `BLOB_READ_WRITE_TOKEN` set:
   ```bash
   BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
   ```

2. Run the script:
   ```bash
   pnpm recompress:images
   ```

3. The script will:
   - Show progress for each image
   - Display compression statistics
   - Show a summary at the end

## Example Output

```
🚀 Starting image re-compression migration...

📊 Found 50 entries to process

📸 Processing entry abc123...
   URL: https://xxx.public.blob.vercel-storage.com/image.jpg
   ⬇️  Downloading original image...
   ✅ Downloaded: 3.45 MB
   🗜️  Compressing image...
   ✅ Compressed: 0.89 MB
   📉 Reduction: 74.2%
   ☁️  Uploading compressed image...
   ✅ Uploaded: https://xxx.public.blob.vercel-storage.com/image-compressed.jpg
   ✅ Database updated

============================================================
📊 COMPRESSION SUMMARY
============================================================
Total entries: 50
✅ Successfully compressed: 45
⏭️  Skipped (already small): 3
❌ Errors: 2

📉 Size Reduction:
   Original total: 150.23 MB
   Compressed total: 45.67 MB
   Total reduction: 69.6%
   Space saved: 104.56 MB

✅ Migration complete!
```

## What Happens to Old Images?

By default, **old images are NOT deleted** - they remain in Vercel Blob storage. This is the safest approach.

If you want to delete old images to save storage costs, you can:
1. Uncomment the deletion code in the script (around line 115)
2. Or manually delete old images from Vercel Blob dashboard after verifying everything works

## Troubleshooting

### Error: "BLOB_READ_WRITE_TOKEN environment variable is required"
- Make sure you've added `BLOB_READ_WRITE_TOKEN` to your `.env` file
- Get the token from Vercel dashboard: https://vercel.com/dashboard/stores

### Error: "Failed to download"
- Check your internet connection
- Verify the image URLs in your database are valid
- Some images might be from external sources (like placekeanu.com) - these will be skipped

### Script is slow
- This is normal - downloading, compressing, and uploading images takes time
- The script includes a 500ms delay between images to avoid rate limiting
- For 100 images, expect ~5-10 minutes

## Safety Features

- ✅ Skips images already smaller than 500KB
- ✅ Continues processing even if individual images fail
- ✅ Shows detailed error messages for failed images
- ✅ Doesn't delete old images by default
- ✅ Updates database atomically (one image at a time)

## Need Help?

If you encounter issues:
1. Check the error messages in the console
2. Verify your environment variables are set correctly
3. Make sure your database is accessible
4. Check Vercel Blob storage quota

