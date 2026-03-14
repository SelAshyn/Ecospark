import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const body = await request.json();
    const { name, category, isOrganic } = body;

    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: 'Name and category required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash'
    });

    const prompt = `You are an agricultural sustainability expert. Analyze this resource and provide sustainability metrics.

Resource Name: ${name}
Category: ${category}
Is Organic/Eco-friendly: ${isOrganic ? 'Yes' : 'No'}

Provide a JSON response with:
1. sustainabilityScore: A number from 0-100 based on environmental impact
2. co2Savings: A brief, specific description of CO2 savings or environmental benefits (1-2 sentences, be specific with numbers or percentages when possible)

Consider factors like:
- Organic vs synthetic production
- Water usage
- Chemical reduction
- Soil health impact
- Carbon sequestration
- Waste reduction
- Local vs imported

Respond ONLY with valid JSON in this exact format:
{
  "sustainabilityScore": 85,
  "co2Savings": "Reduces chemical fertilizer use by 40 percent, saving approximately 2.5 kg CO2 per kg compared to synthetic alternatives"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const data = JSON.parse(jsonMatch[0]);

    // Validate the response
    if (typeof data.sustainabilityScore !== 'number' || !data.co2Savings) {
      throw new Error('Invalid data structure from AI');
    }

    // Ensure score is between 0-100
    data.sustainabilityScore = Math.max(0, Math.min(100, data.sustainabilityScore));

    return NextResponse.json({
      success: true,
      sustainabilityScore: data.sustainabilityScore,
      co2Savings: data.co2Savings,
    });

  } catch (error: any) {
    console.error('Sustainability Calculation Error:', error);

    // Provide fallback values if AI fails
    return NextResponse.json({
      success: true,
      sustainabilityScore: 75,
      co2Savings: 'Organic production reduces environmental impact and supports sustainable farming practices',
      fallback: true,
    });
  }
}
