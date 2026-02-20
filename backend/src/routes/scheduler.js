const express = require('express');
const router = express.Router();
const cron = require('node-cron');
const { protect } = require('../middleware/auth');
const Post = require('../models/Post');

// ─── Cron job : publier les posts planifiés (toutes les minutes) ──────────────
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const duePosts = await Post.find({
      status: 'scheduled',
      scheduledAt: { $lte: now }
    }).populate('user');
    
    for (const post of duePosts) {
      try {
        // TODO: Intégrer les vraies API Instagram/TikTok ici
        // Pour l'instant, marquer comme "publié" (simulation)
        // En production, utiliser Instagram Graph API et TikTok Content API
        
        await Post.findByIdAndUpdate(post._id, {
          status: 'published',
          publishedAt: now,
          socialPostId: `sim_${Date.now()}` // Simulation
        });
        
        console.log(`✅ Post ${post._id} publié sur ${post.platform}`);
      } catch (postError) {
        await Post.findByIdAndUpdate(post._id, {
          status: 'failed',
          publishError: postError.message
        });
        console.error(`❌ Erreur publication post ${post._id}:`, postError.message);
      }
    }
  } catch (error) {
    console.error('Cron scheduler error:', error);
  }
});

// ─── Planifier un post ────────────────────────────────────────────────────────
router.post('/schedule', protect, async (req, res) => {
  try {
    const { postId, scheduledAt } = req.body;
    
    if (!postId || !scheduledAt) {
      return res.status(400).json({ success: false, error: 'postId et scheduledAt requis' });
    }
    
    const date = new Date(scheduledAt);
    if (date <= new Date()) {
      return res.status(400).json({ success: false, error: 'La date doit être dans le futur' });
    }
    
    const post = await Post.findOneAndUpdate(
      { _id: postId, user: req.user._id },
      { scheduledAt: date, status: 'scheduled' },
      { new: true }
    );
    
    if (!post) return res.status(404).json({ success: false, error: 'Post introuvable' });
    
    res.json({ success: true, post, message: `Post planifié pour le ${date.toLocaleString('fr-FR')}` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur planification' });
  }
});

// ─── Annuler la planification ─────────────────────────────────────────────────
router.post('/cancel/:postId', protect, async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.postId, user: req.user._id, status: 'scheduled' },
      { status: 'draft', scheduledAt: null },
      { new: true }
    );
    
    if (!post) return res.status(404).json({ success: false, error: 'Post planifié introuvable' });
    
    res.json({ success: true, post, message: 'Planification annulée' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur annulation' });
  }
});

// ─── Posts planifiés ──────────────────────────────────────────────────────────
router.get('/upcoming', protect, async (req, res) => {
  try {
    const posts = await Post.find({
      user: req.user._id,
      status: 'scheduled',
      scheduledAt: { $gte: new Date() }
    }).sort({ scheduledAt: 1 }).limit(20);
    
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur' });
  }
});

module.exports = router;
