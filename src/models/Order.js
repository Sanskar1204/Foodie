const { mongoose } = require('../db');

const OrderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 } // rupees at order time
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    items: { type: [OrderItemSchema], default: [] },
    amountRupees: { type: Number, required: true, min: 0 },
    amountPaise: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: { type: String, default: 'created', index: true }, // created|authorized|paid|captured|failed|refunded
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String, index: true },
    receipt: { type: String },
    customerName: { type: String },
    customerEmail: { type: String },
    customerContact: { type: String },
    notes: { type: Object, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
