// Initialize logger early
import '@/lib/logger-init'

import OpenAI from 'openai'

// Lazy initialization to avoid build-time errors
let openaiInstance: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiInstance
}

interface ImageAnalysisResult {
  analysis: string
  highlights: string[]
}

interface PersonalizedEmailContent {
  subject: string
  body: string
  htmlBody: string
}

/**
 * Analyzes an image using GPT-4O Mini vision capabilities
 * Returns personalized insights about the image
 */
export async function analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
  try {
    const openai = getOpenAI()
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a friendly, enthusiastic image analyzer. Your job is to analyze photos and provide specific, positive, and genuine observations about what you see. Be concise, authentic, and focus on what makes the image interesting or special.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image and provide:
1. A brief, specific observation about what makes this photo interesting or special (2-3 sentences max)
2. 2-3 specific highlights or details you notice (bullet points)

Be genuine, positive, and specific. If it's a house, mention architectural details, colors, or atmosphere. If it's a person, mention their expression or the moment captured. If it's a place, mention what makes it unique.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    })

    const content = response.choices[0]?.message?.content || ''
    
    // Parse the response to extract analysis and highlights
    const lines = content.split('\n').filter(line => line.trim())
    const analysis = lines.find(line => !line.startsWith('-') && !line.startsWith('•')) || lines[0] || ''
    const highlights = lines
      .filter(line => line.startsWith('-') || line.startsWith('•'))
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .filter(Boolean)

    return {
      analysis: analysis.trim(),
      highlights: highlights.length > 0 ? highlights : [analysis],
    }
  } catch (error) {
    console.error('Error analyzing image:', error)
    // Fallback to generic analysis
    return {
      analysis: 'Your photo looks great!',
      highlights: ['Nice composition', 'Great moment captured'],
    }
  }
}

/**
 * Generates personalized, Gen Z-friendly email content based on image analysis
 */
export async function generatePersonalizedEmail(
  studentName: string,
  imageUrl: string | null,
  imageAnalysis: ImageAnalysisResult | null,
  voteCount: number,
  entryId: string | null,
  appUrl: string
): Promise<PersonalizedEmailContent> {
  const hasEntry = !!entryId
  const entryUrl = entryId ? `${appUrl}/post/${entryId}` : null
  const voteUrl = `${appUrl}/vote`

  // If we have image analysis, use GPT to generate personalized content
  if (imageAnalysis && imageUrl) {
    try {
      const openai = getOpenAI()
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are writing a personalized email for a Gen Z student (born around 2006, ~18 years old). 
- Keep it SHORT and CONCISE (2 sentences max for the body)
- Use casual, friendly language - write like you're texting a friend
- It's okay to use Gen Z slang naturally (like "fire", "slaps", "vibe", "no cap", "fr", etc.) but don't overdo it - keep it authentic
- Be enthusiastic but genuine
- Focus on their specific photo and encourage them to share it
- Format your response as: SUBJECT: [subject line]\n\nBODY: [email body]
- Don't include any other text in your response,
- only lowercase, no uppercase, no special characters, no emojis, no markdown, no html, no bold, no italic, no underline, no strikethrough, no list, no code, no blockquote, no pre, no hr, no table, no image, no link, no anything else`,
          },
          {
            role: 'user',
            content: `Write a personalized email for ${studentName} about their photo submission.

Image Analysis: ${imageAnalysis.analysis}
Highlights: ${imageAnalysis.highlights.join(', ')}

Stats:
- Votes: ${voteCount} ${voteCount === 1 ? 'vote' : 'votes'}
- Has entry: ${hasEntry}

Write a short, Gen Z-friendly email that:
1. Mentions something specific about their photo (use the analysis - be specific!)
2. Encourages them to share and get votes
3. Keeps it casual, fun, and authentic

Format: SUBJECT: [short catchy subject, max 50 chars]\n\nBODY: [2-3 sentence email body]`,
          },
        ],
        max_tokens: 250,
        temperature: 0.8,
      })

      const content = response.choices[0]?.message?.content || ''
      
      // Parse subject and body from response
      let subject = `Your ISPgram Update 🔥`
      let body = content

      // Try to extract subject and body
      const subjectMatch = content.match(/SUBJECT:\s*(.+?)(?:\n|$)/i)
      const bodyMatch = content.match(/BODY:\s*(.+)/i)
      
      if (subjectMatch) {
        subject = subjectMatch[1].trim()
      }
      
      if (bodyMatch) {
        body = bodyMatch[1].trim()
      } else {
        // Fallback: use the content but remove subject line if present
        body = content.replace(/SUBJECT:.*/i, '').trim()
      }

      // Ensure we have a body
      if (!body || body.length < 10) {
        body = `Hey ${studentName}! ${imageAnalysis.analysis} Your photo is getting attention - share it to get more votes! 🔥`
      }

      // Add entry link and CTA
      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p style="font-size: 16px; line-height: 1.6; color: #1f2937;">
            ${body.replace(/\n/g, '<br>')}
          </p>
          ${entryUrl ? `
          <div style="margin: 24px 0; text-align: center;">
            <a href="${entryUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Your Entry →
            </a>
          </div>
          ` : ''}
          <p style="font-size: 14px; color: #6b7280; margin-top: 24px; text-align: center;">
            Share with friends to get more votes! Every vote counts 🎯
          </p>
          ${voteCount > 0 ? `
          <p style="font-size: 14px; color: #10b981; font-weight: 600; text-align: center; margin-top: 12px;">
            You've got ${voteCount} ${voteCount === 1 ? 'vote' : 'votes'} so far! Keep it going! 🔥
          </p>
          ` : ''}
          <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
            <a href="${voteUrl}" style="color: #3b82f6; text-decoration: none; font-size: 14px;">Check out other entries →</a>
          </div>
        </div>
      `

      return {
        subject: subject.length > 50 ? subject.substring(0, 50) : subject,
        body,
        htmlBody,
      }
    } catch (error) {
      console.error('Error generating personalized email:', error)
      // Fallback to template-based email
    }
  }

  // Fallback: Generate template-based personalized email
  return generateTemplateEmail(studentName, voteCount, entryUrl, voteUrl, appUrl)
}

/**
 * Fallback template-based email generator
 */
function generateTemplateEmail(
  studentName: string,
  voteCount: number,
  entryUrl: string | null,
  voteUrl: string,
  appUrl: string
): PersonalizedEmailContent {
  let subject = 'Your ISPgram Update 🔥'
  let body = ''

  if (entryUrl && voteCount > 0) {
    subject = `You got ${voteCount} ${voteCount === 1 ? 'vote' : 'votes'}! 🔥`
    body = `Hey ${studentName}! Your photo is getting love - you've got ${voteCount} ${voteCount === 1 ? 'vote' : 'votes'}! Share it with friends to get even more. No cap, your entry is fire! 🎯`
  } else if (entryUrl) {
    subject = 'Your Entry is Live! 🚀'
    body = `Hey ${studentName}! Your entry is live and ready for votes. Share it with friends and get them to vote for you! The more votes, the better your chances. Let's go! 🔥`
  } else {
    subject = 'Ready to Share Your Adventure? 📸'
    body = `Hey ${studentName}! Ready to show off your Education Week highlight? Submit your photo and start getting votes! Check out what others shared too.`
  }

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <p style="font-size: 16px; line-height: 1.6; color: #1f2937;">
        ${body}
      </p>
      ${entryUrl ? `
      <div style="margin: 24px 0; text-align: center;">
        <a href="${entryUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          View Your Entry →
        </a>
      </div>
      ` : `
      <div style="margin: 24px 0; text-align: center;">
        <a href="${appUrl}/submit" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Submit Your Photo →
        </a>
      </div>
      `}
      <p style="font-size: 14px; color: #6b7280; margin-top: 24px; text-align: center;">
        Share with friends to get more votes! Every vote counts 🎯
      </p>
      ${voteCount > 0 ? `
      <p style="font-size: 14px; color: #10b981; font-weight: 600; text-align: center; margin-top: 12px;">
        You've got ${voteCount} ${voteCount === 1 ? 'vote' : 'votes'} so far! Keep it going! 🔥
      </p>
      ` : ''}
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <a href="${voteUrl}" style="color: #3b82f6; text-decoration: none; font-size: 14px;">Check out other entries →</a>
      </div>
    </div>
  `

  return {
    subject,
    body,
    htmlBody,
  }
}

