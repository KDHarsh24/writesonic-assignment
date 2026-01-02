import dbConnect from '../../../../lib/mongodb';
import AnalysisResult from '../../../../models/AnalysisResult';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  await dbConnect();

  const { id } = req.query;

  try {
    // Get all results for this brand
    const results = await AnalysisResult.find({ brandId: id })
      .populate('queryId')
      .sort({ analyzedAt: -1 });

    // Group results by query
    const resultsByQuery = {};
    results.forEach((result) => {
      const queryKey = result.queryText;
      if (!resultsByQuery[queryKey]) {
        resultsByQuery[queryKey] = {
          query: result.queryText,
          queryId: result.queryId?._id,
          results: [],
          userBrandMentionCount: 0,
          totalRuns: 0,
        };
      }
      resultsByQuery[queryKey].results.push({
        id: result._id,
        analyzedAt: result.analyzedAt,
        userBrandMentioned: result.userBrandMentioned,
        userBrandRank: result.userBrandRank,
        userBrandSentiment: result.userBrandSentiment,
        totalBrandsMentioned: result.totalBrandsMentioned,
        aiResponse: result.aiResponse,
        brandMentions: result.brandMentions,
        citations: result.citations,
      });
      resultsByQuery[queryKey].totalRuns++;
      if (result.userBrandMentioned) {
        resultsByQuery[queryKey].userBrandMentionCount++;
      }
    });

    // Calculate visibility per query
    const queriesWithStats = Object.values(resultsByQuery).map((q) => ({
      ...q,
      visibility: q.totalRuns > 0 
        ? Math.round((q.userBrandMentionCount / q.totalRuns) * 100) 
        : 0,
      latestResult: q.results[0],
    }));

    res.status(200).json({ success: true, data: queriesWithStats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
