const Razorpay = require('razorpay');

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

module.exports = { getRazorpay };
