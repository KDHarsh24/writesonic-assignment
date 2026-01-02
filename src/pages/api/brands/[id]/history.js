import dbConnect from '../../../../lib/mongodb';
import AnalysisResult from '../../../../models/AnalysisResult';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  await dbConnect();

  const { id } = req.query;
  const { days = 30 } = req.query;

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const results = await AnalysisResult.find({
      brandId: id,
      analyzedAt: { $gte: startDate },
    }).sort({ analyzedAt: 1 });

    // Group by date
    const historyByDate = {};
    results.forEach((result) => {
      const dateKey = result.analyzedAt.toISOString().split('T')[0];
      if (!historyByDate[dateKey]) {
        historyByDate[dateKey] = {
          date: dateKey,
          total: 0,
          mentioned: 0,
          avgRank: [],
          sentiments: { positive: 0, negative: 0, neutral: 0 },
        };
      }
      historyByDate[dateKey].total++;
      if (result.userBrandMentioned) {
        historyByDate[dateKey].mentioned++;
        if (result.userBrandRank) {
          historyByDate[dateKey].avgRank.push(result.userBrandRank);
        }
        if (result.userBrandSentiment && result.userBrandSentiment !== 'not_mentioned') {
          historyByDate[dateKey].sentiments[result.userBrandSentiment]++;
        }
      }
    });

    // Calculate visibility for each day
    const history = Object.values(historyByDate).map((day) => ({
      date: day.date,
      visibility: day.total > 0 ? Math.round((day.mentioned / day.total) * 100) : 0,
      total: day.total,
      mentioned: day.mentioned,
      avgRank: day.avgRank.length > 0 
        ? Math.round((day.avgRank.reduce((a, b) => a + b, 0) / day.avgRank.length) * 10) / 10 
        : null,
      sentiments: day.sentiments,
    }));

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
