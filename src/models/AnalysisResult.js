import mongoose from 'mongoose';

const BrandMentionSchema = new mongoose.Schema({
  brandName: {
    type: String,
    required: true,
  },
  rank: {
    type: Number,
    default: null,
  },
  context: {
    type: String,
    default: '',
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral',
  },
  isUserBrand: {
    type: Boolean,
    default: false,
  },
});

const CitationSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  domain: {
    type: String,
    default: '',
  },
});

const AnalysisResultSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  queryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Query',
    required: true,
  },
  queryText: {
    type: String,
    required: true,
  },
  aiResponse: {
    type: String,
    required: true,
  },
  brandMentions: [BrandMentionSchema],
  citations: [CitationSchema],
  userBrandMentioned: {
    type: Boolean,
    default: false,
  },
  userBrandRank: {
    type: Number,
    default: null,
  },
  userBrandSentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral', 'not_mentioned'],
    default: 'not_mentioned',
  },
  totalBrandsMentioned: {
    type: Number,
    default: 0,
  },
  totalCitations: {
    type: Number,
    default: 0,
  },
  analyzedAt: {
    type: Date,
    default: Date.now,
  },
  platform: {
    type: String,
    enum: ['chatgpt', 'perplexity', 'claude', 'gemini'],
    default: 'chatgpt',
  },
});

// Index for faster queries
AnalysisResultSchema.index({ brandId: 1, analyzedAt: -1 });
AnalysisResultSchema.index({ brandId: 1, queryId: 1 });

export default mongoose.models.AnalysisResult || mongoose.model('AnalysisResult', AnalysisResultSchema);
