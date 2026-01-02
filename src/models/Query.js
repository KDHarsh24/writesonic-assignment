import mongoose from 'mongoose';

const QuerySchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  query: {
    type: String,
    required: [true, 'Query text is required'],
    trim: true,
  },
  isCustom: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastAnalyzedAt: {
    type: Date,
    default: null,
  },
});

export default mongoose.models.Query || mongoose.model('Query', QuerySchema);
