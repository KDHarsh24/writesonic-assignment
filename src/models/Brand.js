import mongoose from 'mongoose';

const BrandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true,
  },
  website: {
    type: String,
    required: [true, 'Website is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  competitors: [{
    type: String,
    trim: true,
  }],
  keywords: [{
    type: String,
    trim: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

BrandSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
