const express = require('express');
const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const { getRazorpay } = require('../utils/razorpay');

const router = express.Router();

async function buildOrderItems(items) {
  const ids = items.map((i) => i.menuItemId);
  const menuItems = await MenuItem.find({ _id: { $in: ids } }).lean();
  const idToItem = new Map(menuItems.map((mi) => [String(mi._id), mi]));
  const orderItems = [];
  let totalRupees = 0;

  for (const input of items) {
    const menuItem = idToItem.get(String(input.menuItemId));
    if (!menuItem || !menuItem.isAvailable) {
      throw new Error('Invalid or unavailable menu item: ' + input.menuItemId);
    }
    const quantity = Math.max(1, Number(input.quantity || 1));
    const unitPrice = Number(menuItem.price);
    totalRupees += unitPrice * quantity;
    orderItems.push({
      menuItem: menuItem._id,
      quantity,
      unitPrice
    });
  }

  return { orderItems, totalRupees };
}

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { items, customerName, customerEmail, customerContact, notes } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array required' });
    }

    const { orderItems, totalRupees } = await buildOrderItems(items);
    const amountPaise = Math.round(totalRupees * 100);

    const orderDoc = await Order.create({
      items: orderItems,
      amountRupees: totalRupees,
      amountPaise,
      currency: 'INR',
      status: 'created',
      customerName,
      customerEmail,
      customerContact,
      notes: notes || {}
    });

    const rp = getRazorpay();
    const rpOrder = await rp.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: String(orderDoc._id),
      notes: { ...orderDoc.notes, orderId: String(orderDoc._id) }
    });

    orderDoc.razorpayOrderId = rpOrder.id;
    orderDoc.receipt = rpOrder.receipt;
    await orderDoc.save();

    res.json({ order: orderDoc.toObject(), razorpayOrder: rpOrder });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to create order' });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const order = await Order.findById(req.params.id)
      .populate({ path: 'items.menuItem' })
      .lean();
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to fetch order' });
  }
});

module.exports = router;
