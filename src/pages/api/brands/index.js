import dbConnect from '../../../lib/mongodb';
import Brand from '../../../models/Brand';

export default async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const brands = await Brand.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: brands });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const { name, website, category, description, competitors, keywords } = req.body;

        if (!name || !website || !category) {
          return res.status(400).json({ 
            success: false, 
            error: 'Name, website, and category are required' 
          });
        }

        const brand = await Brand.create({
          name,
          website,
          category,
          description: description || '',
          competitors: competitors || [],
          keywords: keywords || [],
        });

        res.status(201).json({ success: true, data: brand });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
