import dbConnect from '../../../../lib/mongodb';
import Brand from '../../../../models/Brand';
import Query from '../../../../models/Query';
import AnalysisResult from '../../../../models/AnalysisResult';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  await dbConnect();

  const { id } = req.query;
  const { startDate, endDate, queryId } = req.query;

  try {
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ success: false, error: 'Brand not found' });
    }

    // Build query filter
    const filter = { brandId: id };
    if (queryId) {
      filter.queryId = queryId;
    }
    if (startDate || endDate) {
      filter.analyzedAt = {};
      if (startDate) filter.analyzedAt.$gte = new Date(startDate);
      if (endDate) filter.analyzedAt.$lte = new Date(endDate);
    }

    // Get all analysis results
    const results = await AnalysisResult.find(filter)
      .sort({ analyzedAt: -1 })
      .populate('queryId');

    // Calculate metrics
    const totalResults = results.length;
    const mentionedResults = results.filter((r) => r.userBrandMentioned);
    const visibilityScore = totalResults > 0 
      ? Math.round((mentionedResults.length / totalResults) * 100) 
      : 0;

    // Calculate sentiment distribution
    const sentimentCounts = {
      positive: results.filter((r) => r.userBrandSentiment === 'positive').length,
      negative: results.filter((r) => r.userBrandSentiment === 'negative').length,
      neutral: results.filter((r) => r.userBrandSentiment === 'neutral').length,
      not_mentioned: results.filter((r) => r.userBrandSentiment === 'not_mentioned').length,
    };

    // Calculate average rank when mentioned
    const rankedResults = results.filter((r) => r.userBrandRank !== null);
    const averageRank = rankedResults.length > 0
      ? Math.round((rankedResults.reduce((sum, r) => sum + r.userBrandRank, 0) / rankedResults.length) * 10) / 10
      : null;

    // Get rank distribution
    const rankDistribution = {
      first: rankedResults.filter((r) => r.userBrandRank === 1).length,
      second: rankedResults.filter((r) => r.userBrandRank === 2).length,
      third: rankedResults.filter((r) => r.userBrandRank === 3).length,
      other: rankedResults.filter((r) => r.userBrandRank > 3).length,
    };

    // Get all brand mentions across results for leaderboard
    const brandMentionCounts = {};
    results.forEach((result) => {
      result.brandMentions.forEach((mention) => {
        const name = mention.brandName?.toLowerCase();
        if (name) {
          if (!brandMentionCounts[name]) {
            brandMentionCounts[name] = { 
              count: 0, 
              name: mention.brandName,
              sentiments: { positive: 0, negative: 0, neutral: 0 },
              ranks: [],
            };
          }
          brandMentionCounts[name].count++;
          if (mention.sentiment) {
            brandMentionCounts[name].sentiments[mention.sentiment]++;
          }
          if (mention.rank) {
            brandMentionCounts[name].ranks.push(mention.rank);
          }
        }
      });
    });

    // Create leaderboard
    const leaderboard = Object.values(brandMentionCounts)
      .map((brand) => ({
        name: brand.name,
        mentions: brand.count,
        visibility: Math.round((brand.count / totalResults) * 100),
        avgRank: brand.ranks.length > 0 
          ? Math.round((brand.ranks.reduce((a, b) => a + b, 0) / brand.ranks.length) * 10) / 10 
          : null,
        sentiment: {
          positive: brand.sentiments.positive,
          negative: brand.sentiments.negative,
          neutral: brand.sentiments.neutral,
        },
        isUserBrand: brand.name.toLowerCase() === brand.name.toLowerCase(),
      }))
      .sort((a, b) => b.mentions - a.mentions);

    // Get top citations
    const citationCounts = {};
    results.forEach((result) => {
      result.citations.forEach((citation) => {
        const domain = citation.domain || citation.url;
        if (domain) {
          if (!citationCounts[domain]) {
            citationCounts[domain] = { domain, count: 0, urls: [] };
          }
          citationCounts[domain].count++;
          if (!citationCounts[domain].urls.includes(citation.url)) {
            citationCounts[domain].urls.push(citation.url);
          }
        }
      });
    });

    const topCitations = Object.values(citationCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get queries summary
    const queries = await Query.find({ brandId: id });
    const querySummary = {
      total: queries.length,
      completed: queries.filter((q) => q.status === 'completed').length,
      pending: queries.filter((q) => q.status === 'pending').length,
      processing: queries.filter((q) => q.status === 'processing').length,
      failed: queries.filter((q) => q.status === 'failed').length,
    };

    res.status(200).json({
      success: true,
      data: {
        brand: {
          id: brand._id,
          name: brand.name,
          category: brand.category,
          website: brand.website,
        },
        metrics: {
          visibilityScore,
          totalPrompts: totalResults,
          answersMentioned: mentionedResults.length,
          averageRank,
          sentimentScore: totalResults > 0 
            ? Math.round((sentimentCounts.positive / (totalResults - sentimentCounts.not_mentioned || 1)) * 100)
            : 0,
        },
        sentimentDistribution: sentimentCounts,
        rankDistribution,
        leaderboard,
        topCitations,
        querySummary,
        recentResults: results.slice(0, 10),
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
