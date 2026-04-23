/**
 * Backend: Razorpay Payment Routes
 * Stack: Node.js + Express
 * Install: npm install razorpay crypto
 *
 * Add these env vars to your .env:
 *   RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
 *   RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
 */

const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order
// Creates a Razorpay order on the backend
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Invalid amount. Minimum is ₹1 (100 paise).' });
    }

    const order = await razorpay.orders.create({
      amount,       // in paise
      currency,
      receipt,
      notes,
    });

    res.json(order);
  } catch (err) {
    console.error('Razorpay create-order error:', err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// POST /api/payments/verify
// Verifies Razorpay payment signature
router.post('/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const verified = expectedSignature === razorpay_signature;

    if (verified) {
      // TODO: Update order status to 'paid' in your database here
      res.json({ verified: true, paymentId: razorpay_payment_id });
    } else {
      res.status(400).json({ verified: false, error: 'Invalid signature' });
    }
  } catch (err) {
    console.error('Razorpay verify error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// POST /api/payments/webhook
// Handle Razorpay webhooks (payment.captured, payment.failed, etc.)
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body)
    .digest('hex');

  if (expectedSignature !== signature) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const event = JSON.parse(req.body);

  switch (event.event) {
    case 'payment.captured':
      console.log('Payment captured:', event.payload.payment.entity.id);
      // TODO: Mark order as paid in DB
      break;
    case 'payment.failed':
      console.log('Payment failed:', event.payload.payment.entity.id);
      // TODO: Mark order as payment_failed in DB
      break;
    default:
      console.log('Unhandled webhook event:', event.event);
  }

  res.json({ received: true });
});

module.exports = router;
