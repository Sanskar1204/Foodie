const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const crypto = require('crypto');
const { connectToDatabase } = require('./db');
const { getRazorpay } = require('./utils/razorpay');
const menuRouter = require('./routes/menu');
const ordersRouter = require('./routes/orders');
const Order = require('./models/Order');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
// Raw body for Razorpay webhooks must be available for signature verification
app.use('/api/payments/webhook', express.raw({ type: '*/*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static demo checkout page
app.use(express.static(path.join(process.cwd(), 'public')));

// Initialize database connection (non-blocking)
connectToDatabase().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to connect to MongoDB at startup:', error?.message || error);
});

// Health
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Expose public key for client checkout
app.get('/api/config/public-key', (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID || '' });
});

// Create order
app.post('/api/payments/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body || {};
    if (!amount) {
      return res.status(400).json({ error: 'amount is required (in smallest currency unit)' });
    }
    const rp = getRazorpay();
    const order = await rp.orders.create({
      amount: Number(amount),
      currency: currency || 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {}
    });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to create order' });
  }
});

// Verify payment signature (client posts details after payment)
app.post('/api/payments/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ ok: false, error: 'missing fields' });
  }
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  const isValid = hmac === razorpay_signature;
  if (isValid) {
    try {
      await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { $set: { status: 'paid', razorpayPaymentId: razorpay_payment_id } }
      ).exec();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to update order on verify:', e?.message || e);
    }
  }
  res.json({ ok: isValid });
});

// Webhook handler
// Important: Configure Razorpay dashboard to send webhooks to this endpoint
app.post('/api/payments/webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const signature = req.headers['x-razorpay-signature'];
    if (!webhookSecret || !signature) {
      return res.status(400).send('Missing signature or secret');
    }
    const body = req.body; // raw buffer
    const expected = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
    if (expected !== signature) {
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(body.toString());
    const type = event?.event;
    const paymentEntity = event?.payload?.payment?.entity;
    const orderEntity = event?.payload?.order?.entity;
    const orderId = paymentEntity?.order_id || orderEntity?.id;
    const paymentId = paymentEntity?.id;

    const update = {};
    if (paymentId) update.razorpayPaymentId = paymentId;
    if (type === 'payment.authorized') update.status = 'authorized';
    else if (type === 'payment.captured' || type === 'order.paid') update.status = 'captured';
    else if (type === 'payment.failed') update.status = 'failed';
    else if (type?.startsWith('refund.')) update.status = 'refunded';

    if (orderId && Object.keys(update).length) {
      await Order.findOneAndUpdate({ razorpayOrderId: orderId }, { $set: update }).exec();
    } else if (paymentId && Object.keys(update).length) {
      await Order.findOneAndUpdate({ razorpayPaymentId: paymentId }, { $set: update }).exec();
    }

    res.status(200).send('ok');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Webhook handler error:', err?.message || err);
    res.status(500).send('error');
  }
});

// API routes
app.use('/api/menu', menuRouter);
app.use('/api/orders', ordersRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});
