const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const User = require('../models/User');
const { generateTokens, protect } = require('../middleware/auth');

// ── Register ───────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success:false, error:'Tous les champs sont requis' });
    if (password.length < 8) return res.status(400).json({ success:false, error:'Mot de passe: 8 caractères minimum' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ success:false, error:'Cet email est déjà utilisé' });
    const user = await User.create({ name, email, password });
    const { accessToken, refreshToken } = generateTokens(user._id);
    res.status(201).json({ success:true, accessToken, refreshToken, user:{ _id:user._id, name:user.name, email:user.email, subscription:user.subscription, isAdmin:user.isAdmin } });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ── Login (avec support A2F) ───────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password, twoFAToken } = req.body;
    if (!email || !password) return res.status(400).json({ success:false, error:'Email et mot de passe requis' });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +twoFA.secret +twoFA.enabled');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success:false, error:'Email ou mot de passe incorrect' });
    if (user.isBanned) return res.status(403).json({ success:false, error:'Compte suspendu', code:'BANNED' });

    // A2F requis pour les admins avec A2F activée
    if (user.isAdmin && user.twoFA?.enabled) {
      if (!twoFAToken) return res.status(200).json({ success:false, requires2FA:true, message:'Code A2F requis' });
      const valid = speakeasy.totp.verify({ secret:user.twoFA.secret, encoding:'base32', token:twoFAToken, window:2 });
      if (!valid) return res.status(401).json({ success:false, error:'Code A2F invalide' });
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    const { accessToken, refreshToken } = generateTokens(user._id);
    const fresh = await User.findById(user._id).select('-password -twoFA');
    res.json({ success:true, accessToken, refreshToken, user:fresh });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ── Me ─────────────────────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -twoFA');
    res.json({ success:true, user });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

// ── Refresh token ──────────────────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success:false, error:'Refresh token manquant' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { accessToken, refreshToken:newRefresh } = generateTokens(decoded.id);
    res.json({ success:true, accessToken, refreshToken:newRefresh });
  } catch(e) { res.status(401).json({ success:false, error:'Refresh token invalide' }); }
});

// ── Notifications user ─────────────────────────────────────────────────────────
router.get('/notifications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json({ success:true, notifications:user.notifications?.reverse() || [] });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

router.patch('/notifications/read', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set:{ 'notifications.$[].read':true } });
    res.json({ success:true });
  } catch(e) { res.status(500).json({ success:false, error:e.message }); }
});

module.exports = router;
