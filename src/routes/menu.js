const express = require('express');
const MenuItem = require('../models/MenuItem');

const router = express.Router();

// GET /api/menu
router.get('/', async (req, res) => {
  try {
    const { q, category, tags, minPrice, maxPrice, available, limit, skip } = req.query;
    const filter = {};
    if (available !== undefined) {
      filter.isAvailable = available === 'true';
    }
    if (category) {
      filter.category = category;
    }
    if (tags) {
      const tagList = String(tags)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagList.length) {
        filter.tags = { $in: tagList };
      }
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let query = MenuItem.find(filter).sort({ createdAt: -1 });

    const numericLimit = Math.min(Number(limit) || 50, 100);
    const numericSkip = Number(skip) || 0;

    if (q) {
      query = MenuItem.find({ $text: { $search: q }, ...filter }, { score: { $meta: 'textScore' } }).sort({
        score: { $meta: 'textScore' }
      });
    }

    const total = await MenuItem.countDocuments(q ? { $text: { $search: q }, ...filter } : filter);
    const items = await query.skip(numericSkip).limit(numericLimit).lean();

    res.json({ total, items });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to fetch menu' });
  }
});

// GET /api/menu/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to fetch item' });
  }
});

module.exports = router;
