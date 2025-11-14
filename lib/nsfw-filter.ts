// import * as tf from '@tensorflow/tfjs'
import * as nsfwjs from 'nsfwjs'
import { createCanvas, loadImage } from 'canvas'

let model: nsfwjs.NSFWJS | null = null

/**
 * Load the NSFW detection model (lazy loading)
 */
async function loadModel() {
  if (!model) {
    model = await nsfwjs.load()
  }
  return model
}

/**
 * Check if an image contains NSFW content
 * @param imageBuffer - Image buffer to check
 * @returns Object with isNSFW flag and predictions
 */
export async function checkNSFW(imageBuffer: Buffer) {
  try {
    // Load the model
    const nsfwModel = await loadModel()

    // Load image from buffer using canvas
    const img = await loadImage(imageBuffer)
    
    // Create canvas and draw image
    const canvas = createCanvas(img.width, img.height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    
    // Run prediction directly on canvas
    const predictions = await nsfwModel.classify(canvas as unknown as HTMLCanvasElement)

    // Sort predictions by probability (highest first)
    predictions.sort((a, b) => b.probability - a.probability)

    // Get the top prediction
    const topPrediction = predictions[0]

    // Define NSFW thresholds
    const NSFW_THRESHOLD = 0.6 // 60% confidence threshold
    const NSFW_CATEGORIES = ['Porn', 'Sexy', 'Hentai']

    // Check if top prediction is NSFW with high confidence
    const isNSFW = NSFW_CATEGORIES.includes(topPrediction.className) && 
                   topPrediction.probability > NSFW_THRESHOLD

    // Also check if any NSFW category has high probability
    const highRiskNSFW = predictions.some(
      pred => NSFW_CATEGORIES.includes(pred.className) && pred.probability > NSFW_THRESHOLD
    )

    return {
      isNSFW: isNSFW || highRiskNSFW,
      predictions,
      topPrediction,
      details: {
        category: topPrediction.className,
        confidence: Math.round(topPrediction.probability * 100),
      },
    }
  } catch (error) {
    console.error('NSFW detection error:', error)
    // In case of error, we'll allow the image but log the error
    // You can change this to reject all images on error if preferred
    throw new Error('Failed to analyze image content')
  }
}

/**
 * Dispose the model to free up memory
 */
export async function disposeModel() {
  if (model) {
    // Note: nsfwjs doesn't have a direct dispose method, but TF will handle cleanup
    model = null
  }
}
