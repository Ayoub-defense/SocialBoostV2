const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const { protect, requireAdmin } = require('../middleware/auth');

// Tous les routes admin nécessitent auth + isAdmin
router.use(protect, requireAdmin);

// ── Stats globales ─────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [total, banned, byPlan, recent] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isBanned:true }),
      User.aggregate([{ $group:{ _id:'$subscription.plan', count:{ $sum:1 } } }]),
      User.countDocuments({ createdAt:{ $gte:new Date(Date.now()-7*24*60*60*1000) } }),
    ]);
    const paying = await User.countDocuments({ 'subscription.status':{ $in:['active','trialing'] } });
    res.json({ success:true, stats:{ total, banned, paying, recent, byPlan } });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ── Liste des utilisateurs ─────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { page=1, limit=20, search='', plan='', banned='' } = req.query;
    const query = {};
    if (search) query.$or = [{ name:{ $regex:search, $options:'i' } }, { email:{ $regex:search, $options:'i' } }];
    if (plan) query['subscription.plan'] = plan;
    if (banned === 'true') query.isBanned = true;

    const [users, total] = await Promise.all([
      User.find(query).select('-password -twoFA').sort('-createdAt').skip((page-1)*limit).limit(+limit),
      User.countDocuments(query),
    ]);
    res.json({ success:true, users, total, pages:Math.ceil(total/limit) });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ── Modifier le plan d'un user ─────────────────────────────────────────────────
router.patch('/users/:id/plan', async (req, res) => {
  try {
    const { plan, status='active' } = req.body;
    const valid = ['free','starter','pro','agency'];
    if (!valid.includes(plan)) return res.status(400).json({ error:'Plan invalide' });
    const user = await User.findByIdAndUpdate(req.params.id, {
      'subscription.plan': plan,
      'subscription.status': plan==='free' ? 'inactive' : status,
      'subscription.grantedByAdmin': plan!=='free',
    }, { new:true }).select('-password');
    if (!user) return res.status(404).json({ error:'Utilisateur introuvable' });
    res.json({ success:true, user });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ── Bannir / débannir ──────────────────────────────────────────────────────────
router.patch('/users/:id/ban', async (req, res) => {
  try {
    const { banned, reason='' } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id,
      { isBanned:!!banned, banReason:reason }, { new:true }).select('-password');
    if (!user) return res.status(404).json({ error:'Utilisateur introuvable' });
    res.json({ success:true, user });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ── Supprimer un user ──────────────────────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ error:'Impossible de vous supprimer vous-même' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success:true, message:'Utilisateur supprimé' });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ── Broadcast message ──────────────────────────────────────────────────────────
router.post('/broadcast', async (req, res) => {
  try {
    const { message, type='info', targetPlan='' } = req.body;
    if (!message?.trim()) return res.status(400).json({ error:'Message requis' });
    const query = {};
    if (targetPlan) query['subscription.plan'] = targetPlan;
    const result = await User.updateMany(query, {
      $push:{ notifications:{ message, type, read:false, sentAt:new Date() } }
    });
    res.json({ success:true, sent:result.modifiedCount });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ── Setup A2F admin ────────────────────────────────────────────────────────────
router.post('/2fa/setup', async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name:`SocialBoost Admin (${req.user.email})`, length:20 });
    await User.findByIdAndUpdate(req.user._id, {
      'twoFA.secret': secret.base32,
      'twoFA.verified': false,
    });
    const qrUrl = await QRCode.toDataURL(secret.otpauth_url);
    res.json({ success:true, secret:secret.base32, qrUrl });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ── Vérifier + activer A2F ────────────────────────────────────────────────────
router.post('/2fa/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id).select('+twoFA.secret');
    if (!user?.twoFA?.secret) return res.status(400).json({ error:'A2F non configurée' });
    const valid = speakeasy.totp.verify({ secret:user.twoFA.secret, encoding:'base32', token, window:2 });
    if (!valid) return res.status(400).json({ error:'Code invalide' });
    await User.findByIdAndUpdate(req.user._id, { 'twoFA.enabled':true, 'twoFA.verified':true });
    res.json({ success:true, message:'A2F activée avec succès' });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ── Ajouter une note admin sur un user ────────────────────────────────────────
router.patch('/users/:id/note', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { adminNote:req.body.note||'' }, { new:true }).select('-password');
    res.json({ success:true, user });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

module.exports = router;
