const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// ─── Mettre à jour le profil ──────────────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, settings } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (settings) updateData.settings = { ...req.user.settings, ...settings };
    
    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur mise à jour profil' });
  }
});

// ─── Changer mot de passe ─────────────────────────────────────────────────────
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Les deux mots de passe sont requis' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'Nouveau mot de passe: 8 caractères minimum' });
    }
    
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Mot de passe actuel incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur changement mot de passe' });
  }
});

// ─── Usage stats ──────────────────────────────────────────────────────────────
router.get('/usage', protect, async (req, res) => {
  const limits = req.user.getPlanLimits();
  res.json({
    success: true,
    usage: req.user.usage,
    limits,
    plan: req.user.subscription.plan
  });
});

module.exports = router;

// ─── Route test: activer un plan manuellement (dev/test uniquement) ───────────
router.post('/test-activate-plan', require('../middleware/auth').protect, async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_TEST_PLANS === 'true') {
      const { plan } = req.body;
      const validPlans = ['free', 'starter', 'pro', 'agency'];
      if (!validPlans.includes(plan)) return res.status(400).json({ error: 'Plan invalide' });

      await require('../models/User').findByIdAndUpdate(req.user._id, {
        'subscription.plan': plan,
        'subscription.status': 'active',
      });
      return res.json({ success: true, message: `Plan ${plan} activé en mode test` });
    }
    res.status(403).json({ error: 'Non disponible en production sans ALLOW_TEST_PLANS=true' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
