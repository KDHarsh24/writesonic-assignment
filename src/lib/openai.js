import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
  dangerouslyAllowBrowser: true
});

// --- HELPER FUNCTIONS ---

/**
 * Normalizes a brand name for fuzzy matching.
 * Removes common suffixes like "Inc", "LLC", "Pvt Ltd", etc.
 * Removes punctuation and extra spaces.
 * Converts to lowercase.
 */
function normalizeBrandName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\b(inc|llc|pvt|ltd|limited|corp|corporation|company|co|gmbh|pty)\b\.?/g, '') // Remove corporate suffixes
    .replace(/[^\w\s]/g, '') // Remove punctuation (keep letters, numbers, spaces)
    .trim()
    .replace(/\s+/g, ' '); // Normalize spaces
}

/**
 * Checks if the brandName is present in the text using fuzzy matching.
 */
function isBrandMatch(text, brandName) {
  if (!text || !brandName) return false;
  const normalizedText = normalizeBrandName(text);
  const normalizedBrand = normalizeBrandName(brandName);
  return normalizedText.includes(normalizedBrand);
}

// --- MOCK DATA GENERATORS ---

function getMockQueries(brandName, category) {
  const c = category || 'software';
  return [
    `What is the best ${c} for small businesses in 2024?`,
    `Top rated ${c} tools with AI features`,
    `Compare ${brandName} vs competitors for ${c}`,
    `Free ${c} alternatives for startups`,
    `Who are the market leaders in ${c}?`
  ];
}

function getMockAIResponse(query, brandName, category) {
  const normalizedBrand = normalizeBrandName(brandName);
  
  // Category-specific competitors map
  const competitorMap = {
    'crm': ['Salesforce', 'HubSpot', 'Zoho', 'Pipedrive', 'Monday.com'],
    'marketing': ['Marketo', 'Mailchimp', 'ActiveCampaign', 'Semrush', 'Ahrefs'],
    'productivity': ['Notion', 'Asana', 'ClickUp', 'Trello', 'Slack'],
    'ai': ['Jasper', 'Copy.ai', 'ChatGPT', 'Claude', 'Writesonic', 'Midjourney'],
    'finance': ['QuickBooks', 'Xero', 'FreshBooks', 'Wave', 'NetSuite'],
    'ecommerce': ['Shopify', 'WooCommerce', 'BigCommerce', 'Magento', 'Wix'],
    'design': ['Canva', 'Figma', 'Adobe XD', 'Sketch', 'InVision']
  };

  // Find best matching category or use default
  const catKey = Object.keys(competitorMap).find(k => (category || '').toLowerCase().includes(k)) || 'default';
  let competitors = competitorMap[catKey] || ['Competitor A', 'Competitor B', 'Big Corp', 'Industry Leader', 'Startup X'];
  
  // Ensure we don't list the user's brand as a competitor if it's already in the list (fuzzy check)
  competitors = competitors.filter(c => !isBrandMatch(c, brandName));
  
  // Randomize competitors (pick 3-4)
  const randomCompetitors = competitors.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 3);
  
  // 70% chance to mention the user's brand in the mock response
  const mentionUserBrand = Math.random() > 0.3;
  
  let brandsToMention = [...randomCompetitors];
  if (mentionUserBrand) {
    brandsToMention.push(brandName); // Use the exact name provided by user for display
  }
  
  // Shuffle for ranking
  const finalBrands = brandsToMention.sort(() => 0.5 - Math.random());
  
  const intro = [
    `When looking for the best ${category} solutions, several top contenders stand out based on features, pricing, and user reviews.`,
    `Here is a breakdown of the leading ${category} tools available in 2024.`,
    `Based on current market analysis and user feedback, these are the most recommended ${category} platforms.`
  ];
  
  const descriptions = [
    "is a powerhouse in this space, offering comprehensive features for scaling teams.",
    "stands out for its ease of use and intuitive interface, making it great for beginners.",
    "provides excellent value for money with its robust free tier and affordable plans.",
    "is known for its advanced AI capabilities and automation features.",
    "is a reliable choice with a strong community and extensive integration options.",
    "has recently gained popularity due to its innovative approach to workflow management."
  ];

  let responseText = `${intro[Math.floor(Math.random() * intro.length)]}\n\n`;
  
  finalBrands.forEach((brand, index) => {
    const desc = descriptions[index % descriptions.length];
    responseText += `${index + 1}. **${brand}**: ${brand} ${desc}\n\n`;
  });
  
  responseText += `### Summary\nFor most users, **${finalBrands[0]}** is the top recommendation due to its balance of features and price. However, if you need specific integrations, **${finalBrands[1]}** is also a strong contender.\n\n`;
  
  responseText += `### Sources\n`;
  responseText += `- [G2 ${category} Reviews](https://www.g2.com/categories/${(category || 'software').toLowerCase().replace(/\s+/g, '-')})\n`;
  responseText += `- [Capterra Best ${category} Software](https://www.capterra.com/${(category || 'software').toLowerCase().replace(/\s+/g, '-')})\n`;
  responseText += `- [TechRadar Top Picks](https://www.techradar.com/best/${(category || 'software').toLowerCase().replace(/\s+/g, '-')})`;
  
  return responseText;
}

function getMockAnalysis(aiResponse, userBrandName) {
  // Split by lines to find the list items
  const lines = aiResponse.split('\n');
  let rank = null;
  let sentiment = 'not_mentioned';
  let context = '';
  
  // First, let's find all mentioned brands in the numbered list
  const brandMentions = [];
  
  for (const line of lines) {
    // Matches "1. **Name**:" or "1. Name:" or "1. **Name** -"
    const match = line.match(/^(\d+)\.\s*\*\*?([^*:]+)\*\*?[:\s-]/); 
    if (match) {
      const foundRank = parseInt(match[1]);
      const foundName = match[2].trim();
      
      const isUserBrand = isBrandMatch(foundName, userBrandName);
      
      let itemSentiment = 'positive'; // Default for list items
      let itemContext = line.substring(match[0].length).trim();
      if (itemContext.length > 100) itemContext = itemContext.substring(0, 100) + '...';

      if (isUserBrand) {
        rank = foundRank;
        sentiment = 'positive'; 
        context = itemContext;
      }
      
      brandMentions.push({
        brandName: foundName,
        rank: foundRank,
        context: itemContext,
        sentiment: itemSentiment
      });
    }
  }
  
  // If not found in list, check if mentioned elsewhere (summary)
  if (!rank && isBrandMatch(aiResponse, userBrandName)) {
    sentiment = 'neutral';
    // Try to grab a sentence with the brand
    const sentences = aiResponse.split(/[.!?]+/);
    const mentionSentence = sentences.find(s => isBrandMatch(s, userBrandName));
    if (mentionSentence) {
      context = mentionSentence.trim();
    }
  }

  return {
    brandMentions: brandMentions,
    citations: [
      { url: 'https://www.g2.com', title: 'G2 Reviews', domain: 'g2.com' },
      { url: 'https://www.capterra.com', title: 'Capterra', domain: 'capterra.com' },
      { url: 'https://www.techradar.com', title: 'TechRadar', domain: 'techradar.com' }
    ],
    userBrandMentioned: !!rank || sentiment !== 'not_mentioned',
    userBrandRank: rank,
    userBrandSentiment: sentiment,
    totalBrandsMentioned: brandMentions.length,
    summary: rank 
      ? `Your brand was ranked #${rank} in the list of recommendations.` 
      : (sentiment !== 'not_mentioned' ? 'Your brand was mentioned in the text but not ranked.' : 'Your brand was not mentioned in the top results.')
  };
}

// --- EXPORTED FUNCTIONS ---

export async function generateQueries(brandName, category, website) {
  try {
    if (process.env.DEMO_MODE === 'true') throw new Error('Demo Mode');

    const prompt = `You are an AI visibility expert. Generate 5 natural search queries that a user might ask an AI assistant where the brand "${brandName}" (category: ${category}, website: ${website}) could potentially be mentioned or recommended.

These should be realistic questions people would ask when looking for products/services in this category.

Return ONLY a JSON array of 5 query strings, no explanation. Example format:
["What is the best CRM software for startups?", "Which project management tool should I use?"]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return getMockQueries(brandName, category);
  } catch (error) {
    console.warn('OpenAI API failed (using mock data):', error.message);
    return getMockQueries(brandName, category);
  }
}

export async function getAIResponse(query) {
  // This function is legacy/simple. We prefer getAIResponseWithContext
  return getAIResponseWithContext(query, 'Unknown Brand', 'General');
}

export async function getAIResponseWithContext(query, brandName, category) {
  try {
    if (process.env.DEMO_MODE === 'true') throw new Error('Demo Mode');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: query }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.warn('OpenAI API failed (using mock data):', error.message);
    return getMockAIResponse(query, brandName, category);
  }
}

export async function analyzeResponse(aiResponse, userBrandName, category) {
  try {
    if (process.env.DEMO_MODE === 'true') throw new Error('Demo Mode');

    const analysisPrompt = `Analyze the following AI response for brand mentions and citations.

AI Response to analyze:
"""
${aiResponse}
"""

User's Brand to track: "${userBrandName}"
Category: "${category}"

Analyze and return a JSON object with:
1. "brandMentions": Array of brands mentioned with their rank (order of appearance, 1 = first), context (surrounding text), and sentiment (positive/negative/neutral)
2. "citations": Array of any URLs or sources mentioned with url, title, domain
3. "userBrandMentioned": Boolean if "${userBrandName}" is mentioned
4. "userBrandRank": Number (position where user brand appears, null if not mentioned)
5. "userBrandSentiment": "positive", "negative", "neutral", or "not_mentioned"
6. "totalBrandsMentioned": Number of unique brands mentioned
7. "summary": Brief summary of how brands are discussed

Return ONLY valid JSON, no explanation.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return getMockAnalysis(aiResponse, userBrandName);
  } catch (error) {
    console.warn('OpenAI API failed (using mock data):', error.message);
    return getMockAnalysis(aiResponse, userBrandName);
  }
}
