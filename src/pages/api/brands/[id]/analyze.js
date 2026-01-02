import dbConnect from '../../../../lib/mongodb';
import Brand from '../../../../models/Brand';
import Query from '../../../../models/Query';
import AnalysisResult from '../../../../models/AnalysisResult';
import { getAIResponseWithContext, analyzeResponse } from '../../../../lib/openai';

export const config = {
  api: {
    bodyParser: true,
    responseLimit: false,
  },
  maxDuration: 300, // 5 minutes for analysis
};

async function runSingleAnalysis(brand, query) {
  try {
    // Update query status
    await Query.findByIdAndUpdate(query._id, { status: 'processing' });

    // Get AI response
    const aiResponse = await getAIResponseWithContext(query.query, brand.name, brand.category);

    // Analyze the response
    const analysis = await analyzeResponse(aiResponse, brand.name, brand.category);

    if (!analysis) {
      await Query.findByIdAndUpdate(query._id, { status: 'failed' });
      return null;
    }

    // Prepare brand mentions with user brand flag
    const normalize = (s) => s?.toLowerCase().replace(/\b(inc|llc|pvt|ltd|limited|corp|corporation|company|co)\b\.?/g, '').replace(/[^\w\s]/g, '').trim();
    
    const brandMentions = (analysis.brandMentions || []).map((mention) => ({
      ...mention,
      isUserBrand: normalize(mention.brandName).includes(normalize(brand.name)) || normalize(brand.name).includes(normalize(mention.brandName)),
    }));

    // Create analysis result
    const result = await AnalysisResult.create({
      brandId: brand._id,
      queryId: query._id,
      queryText: query.query,
      aiResponse,
      brandMentions,
      citations: analysis.citations || [],
      userBrandMentioned: analysis.userBrandMentioned || false,
      userBrandRank: analysis.userBrandRank || null,
      userBrandSentiment: analysis.userBrandSentiment || 'not_mentioned',
      totalBrandsMentioned: analysis.totalBrandsMentioned || brandMentions.length,
      totalCitations: (analysis.citations || []).length,
      platform: 'chatgpt',
    });

    // Update query status
    await Query.findByIdAndUpdate(query._id, { 
      status: 'completed',
      lastAnalyzedAt: new Date(),
    });

    return result;
  } catch (error) {
    console.error('Error analyzing query:', query.query, error);
    await Query.findByIdAndUpdate(query._id, { status: 'failed' });
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  await dbConnect();

  const { id } = req.query;
  const { queryId } = req.body; // Optional: analyze specific query

  try {
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ success: false, error: 'Brand not found' });
    }

    let queries;
    if (queryId) {
      // Analyze specific query
      const query = await Query.findById(queryId);
      if (!query) {
        return res.status(404).json({ success: false, error: 'Query not found' });
      }
      queries = [query];
    } else {
      // Analyze all pending queries
      queries = await Query.find({ 
        brandId: id, 
        status: { $in: ['pending', 'failed'] } 
      });
    }

    if (queries.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No queries to analyze',
        data: [] 
      });
    }

    // Run analysis for all queries
    const results = [];
    for (const query of queries) {
      const result = await runSingleAnalysis(brand, query);
      if (result) {
        results.push(result);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `Analyzed ${results.length} queries`,
      data: results 
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
