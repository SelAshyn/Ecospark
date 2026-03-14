import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const message = formData.get('message') as string;
    const imageFile = formData.get('image') as File | null;

    if (!message && !imageFile) {
      return NextResponse.json(
        { success: false, error: 'Message or image required' },
        { status: 400 }
      );
    }

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found, using fallback responses');
      return getFallbackResponse(message, !!imageFile);
    }

    try {
      // Try to use Gemini API
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      const model = genAI.getGenerativeModel({
        model: 'gemini-pro'
      });

      const systemPrompt = `You are a helpful farming assistant for Nepali farmers. Your role is to:

1. Provide practical, sustainable farming advice suitable for small-scale farmers in Nepal
2. Help diagnose crop diseases and pest problems
3. Give step-by-step instructions for repairing common farming tools using locally available materials
4. Suggest eco-friendly and cost-effective solutions
5. Use simple language that farmers with limited literacy can understand
6. Consider Nepal's climate, soil conditions, and available resources

When analyzing images:
- For crops: Identify diseases, nutrient deficiencies, or pest damage
- For tools: Suggest repair methods using local materials like bamboo, rope, wire, wood
- Provide clear, actionable steps

Keep responses concise (3-5 paragraphs), practical, and encouraging.`;

      let result;

      if (imageFile) {
        // Gemini-pro doesn't support images, use gemini-pro-vision
        const visionModel = genAI.getGenerativeModel({
          model: 'gemini-pro-vision'
        });

        const imageBuffer = await imageFile.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString('base64');

        const imagePart = {
          inlineData: {
            data: imageBase64,
            mimeType: imageFile.type,
          },
        };

        const prompt = message || 'Please analyze this image and provide farming advice or repair guidance.';

        result = await visionModel.generateContent([
          systemPrompt + '\n\nUser question: ' + prompt,
          imagePart,
        ]);
      } else {
        // Handle text only
        const fullPrompt = systemPrompt + '\n\nUser question: ' + message;
        result = await model.generateContent(fullPrompt);
      }

      const response = result.response;
      const text = response.text();

      return NextResponse.json({
        success: true,
        response: text,
      });

    } catch (apiError: any) {
      // If API fails, use fallback
      console.warn('Gemini API error, using fallback:', apiError.message);
      return getFallbackResponse(message, !!imageFile);
    }

  } catch (error: any) {
    console.error('Farm Assistant Error:', error);

    // Try to get the message from formData again for fallback
    try {
      const formData = await request.formData();
      const message = formData.get('message') as string;
      const imageFile = formData.get('image') as File | null;
      return getFallbackResponse(message, !!imageFile);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'An unexpected error occurred. Please try again.',
        },
        { status: 500 }
      );
    }
  }
}

// Fallback responses when API is not available
function getFallbackResponse(message: string, hasImage: boolean) {
  const lowerMessage = message?.toLowerCase() || '';

  let response = '';

  if (hasImage) {
    response = `📸 **Image Analysis (Demo Mode)**

I can see you've uploaded an image! In production mode with a valid API key, I would analyze this image to:

• Identify crop diseases or pest problems
• Diagnose nutrient deficiencies from leaf color
• Suggest repair methods for damaged tools
• Provide specific, actionable recommendations

**To enable full AI analysis:**
1. Get a free API key from https://makersuite.google.com/app/apikey
2. Add it to your .env.local file as GEMINI_API_KEY
3. Restart your development server

For now, here's general advice: ${getGeneralAdvice(lowerMessage)}`;
  } else if (lowerMessage.includes('compost')) {
    response = `🌱 **Composting Guide**

Here's how to make compost from kitchen and farm waste:

**Materials Needed:**
• Kitchen scraps (vegetable peels, fruit waste)
• Farm residue (dry leaves, straw, crop stalks)
• Cow dung or chicken manure
• Water

**Steps:**
1. Choose a shaded spot (1m x 1m area)
2. Layer green waste (kitchen scraps) and brown waste (dry leaves) alternately
3. Add a handful of cow dung every 15cm for microbes
4. Keep moist like a squeezed sponge
5. Turn the pile every 2 weeks
6. Ready in 2-3 months when dark and crumbly

**Tips:** Avoid meat, dairy, and oily foods. Chop materials into small pieces for faster decomposition.`;
  } else if (lowerMessage.includes('pest') || lowerMessage.includes('insect')) {
    response = `🐛 **Natural Pest Control**

Organic solutions for common pests in Nepal:

**Neem Oil Spray:**
• Mix 5ml neem oil + 1 liter water + few drops soap
• Spray on affected plants early morning
• Repeat every 7 days

**Garlic-Chili Spray:**
• Blend 10 garlic cloves + 5 green chilies + 1 liter water
• Strain and spray on plants
• Effective against aphids and caterpillars

**Companion Planting:**
• Plant marigolds around vegetables (repels many pests)
• Grow basil near tomatoes (repels flies and mosquitoes)
• Use coriander to attract beneficial insects

**Physical Methods:**
• Yellow sticky traps for flying insects
• Hand-pick large pests early morning
• Use fine mesh nets for protection`;
  } else if (lowerMessage.includes('water') || lowerMessage.includes('irrigation')) {
    response = `💧 **Water Conservation Techniques**

Save water while keeping crops healthy:

**Drip Irrigation (DIY):**
• Use old plastic bottles with small holes
• Bury near plant roots
• Reduces water use by 60%

**Mulching:**
• Cover soil with straw, dry leaves, or grass clippings
• Retains moisture and reduces evaporation
• Keeps soil cool in summer

**Best Watering Practices:**
• Water early morning (5-7 AM) or evening (5-7 PM)
• Water deeply but less frequently
• Check soil moisture before watering (finger test)

**Rainwater Harvesting:**
• Collect roof runoff in drums/tanks
• 1mm rain on 10m² roof = 10 liters water
• Use for irrigation during dry season`;
  } else if (lowerMessage.includes('tool') || lowerMessage.includes('repair') || lowerMessage.includes('fix')) {
    response = `🔧 **Tool Repair Guide**

Fix common farming tools with local materials:

**Broken Hoe Handle:**
• Find strong bamboo or hardwood stick
• Shape to fit the hoe head socket
• Secure with wire or strong rope
• Wrap junction with cloth soaked in tree resin

**Damaged Irrigation Pipe:**
• Clean the damaged area
• Cut a piece from old tire or thick plastic
• Wrap tightly around leak
• Secure with wire at both ends

**Dull Blade Sharpening:**
• Use a flat stone or file
• Sharpen at 20-30 degree angle
• Always push away from body
• Test on paper - should cut cleanly

**Rusty Tools:**
• Soak in vinegar overnight
• Scrub with wire brush
• Coat with mustard oil to prevent rust`;
  } else if (lowerMessage.includes('crop rotation') || lowerMessage.includes('rotation')) {
    response = `🔄 **Crop Rotation Guide**

Improve soil health by rotating crops:

**Why Rotate?**
• Prevents soil nutrient depletion
• Breaks pest and disease cycles
• Improves soil structure naturally

**Simple 3-Year Rotation:**
**Year 1:** Leafy vegetables (spinach, cabbage)
**Year 2:** Legumes (beans, peas) - adds nitrogen
**Year 3:** Root vegetables (radish, carrot)

**Practical Tips:**
• Never plant same family in same spot consecutively
• Follow heavy feeders with nitrogen-fixers
• Keep a simple map of what you planted where

**Good Combinations:**
• Tomatoes → Beans → Cabbage
• Corn → Peas → Potatoes
• Peppers → Lentils → Leafy greens`;
  } else if (lowerMessage.includes('soil') || lowerMessage.includes('fertilizer')) {
    response = `🌾 **Organic Fertilizers**

Make your own fertilizers from farm waste:

**Liquid Fertilizer (Jholmol):**
• Fill bucket with cow dung (1 part)
• Add water (10 parts)
• Let ferment for 15 days, stirring daily
• Dilute 1:10 before applying to plants

**Vermicompost:**
• Use earthworms to process organic waste
• Ready in 45-60 days
• Rich in nutrients and beneficial microbes

**Green Manure:**
• Grow legumes (beans, peas) in off-season
• Plow them into soil before flowering
• Adds nitrogen naturally

**Banana Peel Fertilizer:**
• Dry banana peels in sun
• Grind to powder
• Mix into soil - high in potassium
• Great for flowering plants`;
  } else if (lowerMessage.includes('season') || lowerMessage.includes('plant') || lowerMessage.includes('grow')) {
    response = `🌱 **Seasonal Planting Guide for Nepal**

**Spring (March-May):**
• Vegetables: Tomato, pepper, eggplant, cucumber
• Best time for most summer crops
• Prepare soil with compost

**Monsoon (June-September):**
• Rice, maize, millet
• Leafy greens (spinach, amaranth)
• Ensure good drainage

**Autumn (October-November):**
• Cauliflower, cabbage, broccoli
• Peas, beans, lentils
• Carrots, radish, turnip

**Winter (December-February):**
• Leafy vegetables thrive
• Garlic, onion planting
• Protect from frost with mulch

**General Tips:**
• Start with easy crops: radish, spinach, beans
• Consider your elevation and local climate
• Save seeds from healthy plants`;
  } else if (lowerMessage.includes('mulch')) {
    response = `🍂 **Mulching Benefits & Methods**

Mulching is one of the best things you can do for your crops!

**Benefits:**
• Retains soil moisture (reduces watering by 50%)
• Suppresses weed growth
• Regulates soil temperature
• Adds organic matter as it decomposes
• Prevents soil erosion

**Materials to Use:**
• Straw or hay (best for vegetables)
• Dry leaves (free and abundant)
• Grass clippings (nitrogen-rich)
• Rice husks (excellent for moisture retention)
• Coconut coir (long-lasting)
• Newspaper or cardboard (for pathways)

**How to Apply:**
• Apply 5-10cm thick layer around plants
• Keep mulch away from plant stems (prevent rot)
• Replenish as it decomposes
• Best time: After planting and watering

**Pro Tip:** Mix different materials for best results!`;
  } else if (lowerMessage.includes('intercrop') || lowerMessage.includes('companion')) {
    response = `🌿 **Intercropping & Companion Planting**

Grow multiple crops together for better yields!

**Why Intercrop?**
• Maximizes space usage
• Natural pest control
• Improves soil health
• Reduces disease spread
• Better resource utilization

**Proven Combinations for Nepal:**

**Three Sisters (Traditional):**
• Corn (provides support)
• Beans (fixes nitrogen)
• Squash (ground cover, weed suppression)

**Vegetable Garden:**
• Tomatoes + Basil (improves flavor, repels pests)
• Carrots + Onions (confuses carrot fly)
• Cabbage + Marigolds (repels cabbage worms)
• Beans + Corn (beans climb corn stalks)

**Herbs as Companions:**
• Coriander attracts beneficial insects
• Mint repels ants and aphids
• Garlic deters most pests

**Avoid These Combinations:**
• Onions + Beans (inhibit each other)
• Tomatoes + Potatoes (same disease family)`;
  } else if (lowerMessage.includes('green manure')) {
    response = `🌱 **Green Manure Guide**

Turn plants into natural fertilizer!

**What is Green Manure?**
Growing specific plants and plowing them back into soil before they flower. This adds nutrients, especially nitrogen.

**Best Plants for Nepal:**

**Legumes (Nitrogen-Fixers):**
• Cowpea (Bodi) - fast growing
• Mung bean - 45-60 days
• Lentils - winter season
• Clover - perennial option

**Non-Legumes:**
• Mustard - quick growing
• Buckwheat - improves soil structure
• Sunflower - deep roots break compaction

**How to Use:**
1. Plant after main crop harvest
2. Let grow for 45-60 days
3. Cut before flowering
4. Chop and mix into top 15cm of soil
5. Wait 2-3 weeks before planting next crop

**Benefits:**
• Adds 40-80 kg nitrogen per hectare
• Improves soil structure
• Suppresses weeds
• Prevents erosion`;
  } else if (lowerMessage.includes('vermicompost') || lowerMessage.includes('worm')) {
    response = `🪱 **Vermicomposting Guide**

Use earthworms to make premium compost!

**Why Vermicompost?**
• 5x more nutrients than regular compost
• Ready in just 45-60 days
• No bad smell
• Can be done indoors
• Worms multiply naturally

**Setting Up:**

**Container:**
• Plastic/wooden box with drainage holes
• Size: 60cm x 45cm x 30cm for home use
• Keep in shade

**Bedding:**
• Shredded newspaper or cardboard
• Coconut coir
• Dry leaves
• Moisten well

**Worms:**
• Red wigglers (Eisenia fetida) - best species
• Start with 500-1000 worms
• They double every 2-3 months

**Feeding:**
• Kitchen scraps (no meat, dairy, oil)
• Vegetable peels, fruit waste
• Coffee grounds, tea bags
• Crushed eggshells
• Feed weekly, bury food under bedding

**Harvesting:**
• Ready when dark and crumbly
• Push compost to one side
• Add fresh bedding to other side
• Worms migrate to new food

**Usage:**
• Mix 1:3 with soil for potting
• Top dress around plants
• Make compost tea for liquid fertilizer`;
  } else {
    response = `🌾 **Farm Assistant (Demo Mode)**

Hello! I'm your AI farming assistant. I can help with:

✅ **Sustainable Farming:** Composting, crop rotation, organic methods
✅ **Pest Control:** Natural solutions without chemicals
✅ **Tool Repairs:** Fix equipment with local materials
✅ **Crop Advice:** What to plant and when
✅ **Water Management:** Conservation techniques
✅ **Soil Health:** Organic fertilizers and testing

**Try asking:**
• "How do I make compost?"
• "Natural pest control methods?"
• "How to fix a broken hoe handle?"
• "What should I plant in March?"
• "Water conservation tips?"
• "Tell me about mulching"
• "Intercropping combinations"
• "How to start vermicomposting?"

**Note:** Currently running in demo mode with pre-written expert advice. For full AI-powered analysis, ensure your GEMINI_API_KEY is properly configured.`;
  }

  return NextResponse.json({
    success: true,
    response: response,
  });
}

function getGeneralAdvice(topic: string): string {
  if (topic.includes('crop') || topic.includes('plant')) {
    return 'Focus on seasonal vegetables suitable for Nepal\'s climate. Start with easy crops like radish, spinach, and beans.';
  } else if (topic.includes('soil')) {
    return 'Healthy soil is key! Add compost regularly and practice crop rotation to maintain fertility.';
  } else if (topic.includes('water')) {
    return 'Water early morning or evening to reduce evaporation. Mulch helps retain moisture.';
  }
  return 'Ask me specific questions about composting, pest control, tool repairs, or crop selection!';
}
