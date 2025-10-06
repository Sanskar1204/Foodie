const { mongoose } = require('../db');

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 }, // in rupees for display
    category: { type: String, index: true },
    isAvailable: { type: Boolean, default: true, index: true },
    tags: { type: [String], default: [], index: true }
  },
  { timestamps: true }
);

MenuItemSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('MenuItem', MenuItemSchema);
