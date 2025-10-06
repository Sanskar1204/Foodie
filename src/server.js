const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const crypto = require('crypto');
const Razorpay = require('razorpay');

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

// Lazy Razorpay client factory
function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

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
app.post('/api/payments/verify', (req, res) => {
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
  res.json({ ok: isValid });
});

// Webhook handler
// Important: Configure Razorpay dashboard to send webhooks to this endpoint
app.post('/api/payments/webhook', (req, res) => {
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

    // Safely parse and handle event
    const event = JSON.parse(body.toString());
    // Example: handle payment authorized/captured, order paid, etc.
    // Persist to DB if needed.

    res.status(200).send('ok');
  } catch (err) {
    res.status(500).send('error');
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});
