const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// ─── Config Lemon Squeezy ─────────────────────────────────────────────────────
const LS_API = 'https://api.lemonsqueezy.com/v1';
const lsHeaders = () => ({
  'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
  'Accept': 'application/vnd.api+json',
  'Content-Type': 'application/vnd.api+json'
});

const PLANS = {
  starter: { name: 'Starter', price: 5, variantId: process.env.LS_VARIANT_STARTER },
  pro:     { name: 'Pro',     price: 12, variantId: process.env.LS_VARIANT_PRO },
  agency:  { name: 'Agency',  price: 20, variantId: process.env.LS_VARIANT_AGENCY }
};

// ─── Plans ────────────────────────────────────────────────────────────────────
router.get('/plans', (req, res) => {
  res.json({ success: true, plans: PLANS });
});

// ─── Créer un checkout ────────────────────────────────────────────────────────
router.post('/create-checkout', protect, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ success: false, error: 'Plan invalide' });

    const variantId = PLANS[plan].variantId;
    if (!variantId) return res.status(500).json({ success: false, error: `LS_VARIANT_${plan.toUpperCase()} manquant dans .env` });

    const response = await axios.post(`${LS_API}/checkouts`, {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: req.user.email,
            name: req.user.name,
            custom: { userId: req.user._id.toString(), plan }
          },
          product_options: {
            redirect_url: `${process.env.FRONTEND_URL}/dashboard?subscription=success&plan=${plan}`
          },
          checkout_options: { dark: true }
        },
        relationships: {
          store:   { data: { type: 'stores',   id: process.env.LS_STORE_ID } },
          variant: { data: { type: 'variants', id: variantId } }
        }
      }
    }, { headers: lsHeaders() });

    res.json({ success: true, sessionUrl: response.data.data.attributes.url });
  } catch (error) {
    console.error('LS checkout error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Erreur création paiement' });
  }
});

// ─── Portail client ───────────────────────────────────────────────────────────
router.post('/customer-portal', protect, async (req, res) => {
  try {
    const subId = req.user.subscription?.lsSubscriptionId;
    if (!subId) return res.status(400).json({ success: false, error: 'Aucun abonnement actif' });

    const response = await axios.get(`${LS_API}/subscriptions/${subId}`, { headers: lsHeaders() });
    const url = response.data.data.attributes.urls?.customer_portal;
    if (!url) return res.status(404).json({ success: false, error: 'Portail introuvable' });

    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur portail' });
  }
});

// ─── Abonnement actuel ────────────────────────────────────────────────────────
router.get('/subscription', protect, (req, res) => {
  res.json({ success: true, subscription: req.user.subscription });
});

// ─── Webhook Lemon Squeezy ────────────────────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Vérifier la signature HMAC
    const sig = req.headers['x-signature'];
    const digest = crypto.createHmac('sha256', process.env.LS_WEBHOOK_SECRET).update(req.body).digest('hex');
    if (sig !== digest) return res.status(401).json({ error: 'Signature invalide' });

    const event = JSON.parse(req.body.toString());
    const eventName = event.meta?.event_name;
    const data = event.data;
    const userId = event.meta?.custom_data?.userId;
    const plan   = event.meta?.custom_data?.plan;

    console.log(`📦 Webhook LS: ${eventName} | user: ${userId} | plan: ${plan}`);
    if (!userId) return res.json({ received: true });

    const statusMap = { active: 'active', on_trial: 'trialing', paused: 'inactive', past_due: 'past_due', unpaid: 'past_due', cancelled: 'canceled', expired: 'inactive' };

    switch (eventName) {
      case 'subscription_created':
        await User.findByIdAndUpdate(userId, {
          'subscription.plan': plan || 'starter',
          'subscription.status': 'active',
          'subscription.lsSubscriptionId': data.id,
          'subscription.currentPeriodEnd': new Date(data.attributes.renews_at),
          'subscription.cancelAtPeriodEnd': false
        });
        break;

      case 'subscription_updated':
        await User.findByIdAndUpdate(userId, {
          'subscription.status': statusMap[data.attributes.status] || 'inactive',
          'subscription.currentPeriodEnd': new Date(data.attributes.renews_at),
          'subscription.cancelAtPeriodEnd': data.attributes.cancelled || false
        });
        break;

      case 'subscription_expired':
      case 'subscription_cancelled':
        await User.findByIdAndUpdate(userId, {
          'subscription.plan': 'free',
          'subscription.status': 'inactive',
          'subscription.lsSubscriptionId': null
        });
        break;

      case 'subscription_payment_success':
        await User.findByIdAndUpdate(userId, { 'subscription.status': 'active', 'subscription.currentPeriodEnd': new Date(data.attributes.renews_at) });
        break;

      case 'subscription_payment_failed':
        await User.findByIdAndUpdate(userId, { 'subscription.status': 'past_due' });
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Erreur webhook' });
  }
});

module.exports = router;
