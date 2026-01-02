import dbConnect from '../../../lib/mongodb';
import Brand from '../../../models/Brand';
import Query from '../../../models/Query';
import AnalysisResult from '../../../models/AnalysisResult';

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const brand = await Brand.findById(id);
        if (!brand) {
          return res.status(404).json({ success: false, error: 'Brand not found' });
        }
        res.status(200).json({ success: true, data: brand });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        const brand = await Brand.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!brand) {
          return res.status(404).json({ success: false, error: 'Brand not found' });
        }
        res.status(200).json({ success: true, data: brand });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const brand = await Brand.findByIdAndDelete(id);
        if (!brand) {
          return res.status(404).json({ success: false, error: 'Brand not found' });
        }
        // Also delete associated queries and results
        await Query.deleteMany({ brandId: id });
        await AnalysisResult.deleteMany({ brandId: id });
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
