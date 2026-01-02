import dbConnect from '../../../../lib/mongodb';
import Brand from '../../../../models/Brand';
import Query from '../../../../models/Query';
import { generateQueries } from '../../../../lib/openai';

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const queries = await Query.find({ brandId: id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: queries });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const { query, isCustom } = req.body;

        // If custom query provided, add it
        if (isCustom && query) {
          const newQuery = await Query.create({
            brandId: id,
            query,
            isCustom: true,
            status: 'pending',
          });
          return res.status(201).json({ success: true, data: [newQuery] });
        }

        // Otherwise, generate queries using AI
        const brand = await Brand.findById(id);
        if (!brand) {
          return res.status(404).json({ success: false, error: 'Brand not found' });
        }

        const generatedQueries = await generateQueries(
          brand.name,
          brand.category,
          brand.website
        );

        if (!generatedQueries || generatedQueries.length === 0) {
          return res.status(500).json({ 
            success: false, 
            error: 'Failed to generate queries' 
          });
        }

        // Save all generated queries
        const savedQueries = await Promise.all(
          generatedQueries.map((q) =>
            Query.create({
              brandId: id,
              query: q,
              isCustom: false,
              status: 'pending',
            })
          )
        );

        res.status(201).json({ success: true, data: savedQueries });
      } catch (error) {
        console.error('Error generating queries:', error);
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
