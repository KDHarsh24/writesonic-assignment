import dbConnect from '../../../lib/mongodb';
import Query from '../../../models/Query';

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  switch (req.method) {
    case 'DELETE':
      try {
        const query = await Query.findByIdAndDelete(id);
        if (!query) {
          return res.status(404).json({ success: false, error: 'Query not found' });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        const query = await Query.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!query) {
          return res.status(404).json({ success: false, error: 'Query not found' });
        }
        res.status(200).json({ success: true, data: query });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
