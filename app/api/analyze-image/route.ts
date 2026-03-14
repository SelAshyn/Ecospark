import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, missionType } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Extract base64 data
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Basic validation: Check image size
    const imageSizeKB = imageBuffer.length / 1024;

    // Images that are too small are likely screenshots or invalid
    if (imageSizeKB < 10) {
      return NextResponse.json({
        isValid: false,
        category: 'invalid image',
        confidence: 95,
        description: 'Image file too small. Please upload a proper photo.',
        sustainabilityScore: 0,
        missionMatch: false,
      });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return NextResponse.json({
        isValid: false,
        category: 'AI validation unavailable',
        confidence: 0,
        description: 'AI vision validation is not configured. Please add GEMINI_API_KEY to your .env.local file.',
        sustainabilityScore: 0,
        missionMatch: false,
        error: 'AI_VISION_NOT_CONFIGURED',
        setupInstructions: 'Get API key from https://makersuite.google.com/app/apikey and add to .env.local: GEMINI_API_KEY=your_key_here',
      });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Determine the validation context
    const isMarketplace = !missionType;

    const prompt = isMarketplace
      ? `Analyze this image for an agricultural marketplace listing.

CRITICAL VALIDATION RULES:
1. REJECT if the image contains human faces, selfies, or people as the main subject
2. REJECT if the image shows portraits, group photos, or any human-focused content
3. REJECT if the image is not related to agriculture, farming, or environmental activities
4. ACCEPT ONLY if the image shows: agricultural waste (rice husk, corn stalks, wheat straw), farming tools, crops, plants, soil, compost, seeds, equipment, or farming infrastructure

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "isValid": boolean,
  "category": "string describing what you see",
  "confidence": number between 0-100,
  "description": "detailed explanation",
  "sustainabilityScore": number between 0-10,
  "containsHumans": boolean,
  "reason": "why you made this decision"
}`
      : `Analyze this image for an environmental mission submission.

VALIDATION RULES:
1. REJECT if the image contains human faces or selfies as the main subject
2. ACCEPT images showing environmental activities: planting, composting, recycling, cleanup, conservation
3. ACCEPT images of nature, plants, gardens, sustainable practices
4. Verify the image matches the mission type: ${missionType || 'general environmental activity'}

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "isValid": boolean,
  "category": "string describing what you see",
  "confidence": number between 0-100,
  "description": "detailed explanation",
  "sustainabilityScore": number between 0-10,
  "containsHumans": boolean,
  "reason": "why you made this decision"
}`;

    // Prepare image for Gemini
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: imageBase64.includes('image/png') ? 'image/png' : 'image/jpeg',
      },
    };

    // Generate content with Gemini
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let analysis;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      return NextResponse.json({
        isValid: false,
        category: 'analysis error',
        confidence: 0,
        description: 'Failed to analyze image. Please try again.',
        sustainabilityScore: 0,
        missionMatch: false,
      });
    }

    // Additional validation: Reject if contains humans (especially for marketplace)
    if (analysis.containsHumans && isMarketplace) {
      return NextResponse.json({
        isValid: false,
        category: 'human/person detected',
        confidence: 95,
        description: '❌ Image contains people or human faces. Please upload photos of agricultural items only - no selfies, portraits, or human subjects. We need images of farming tools, crops, agricultural waste, or equipment.',
        sustainabilityScore: 0,
        missionMatch: false,
        reason: analysis.reason || 'Human detected in image',
      });
    }

    // Return the analysis result
    return NextResponse.json({
      isValid: analysis.isValid,
      category: analysis.category,
      confidence: analysis.confidence,
      description: analysis.description,
      sustainabilityScore: analysis.sustainabilityScore,
      missionMatch: analysis.isValid,
      reason: analysis.reason,
      aiProvider: 'Google Gemini 1.5 Flash',
    });

  } catch (error: any) {
    console.error('Image analysis error:', error);

    // Check if it's an API key error
    if (error.message?.includes('API key') || error.message?.includes('PERMISSION_DENIED')) {
      return NextResponse.json({
        isValid: false,
        category: 'API configuration error',
        confidence: 0,
        description: 'Gemini API key is invalid or not configured properly. Please check your GEMINI_API_KEY in .env.local',
        sustainabilityScore: 0,
        error: 'INVALID_API_KEY',
        setupInstructions: 'Get a valid API key from https://makersuite.google.com/app/apikey',
      }, { status: 500 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
