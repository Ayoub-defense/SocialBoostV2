const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Post = require('../models/Post');

// ─── Créer un post ────────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { platform, caption, hashtags, mediaUrl, mediaType, topic, tone, scheduledAt } = req.body;
    
    const post = await Post.create({
      user: req.user._id,
      platform, caption, hashtags, mediaUrl, mediaType,
      topic, tone, aiGenerated: true,
      status: scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
    });
    
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur création post' });
  }
});

// ─── Liste des posts ──────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const { status, platform, page = 1, limit = 20 } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (platform) filter.platform = platform;
    
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Post.countDocuments(filter);
    
    res.json({ success: true, posts, pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur récupération posts' });
  }
});

// ─── Un post ──────────────────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, user: req.user._id });
    if (!post) return res.status(404).json({ success: false, error: 'Post introuvable' });
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur' });
  }
});

// ─── Modifier un post ─────────────────────────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!post) return res.status(404).json({ success: false, error: 'Post introuvable' });
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur modification' });
  }
});

// ─── Supprimer un post ────────────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!post) return res.status(404).json({ success: false, error: 'Post introuvable' });
    res.json({ success: true, message: 'Post supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur suppression' });
  }
});

// ─── Calendrier (posts du mois) ───────────────────────────────────────────────
router.get('/calendar/:year/:month', protect, async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const posts = await Post.find({
      user: req.user._id,
      $or: [
        { scheduledAt: { $gte: startDate, $lte: endDate } },
        { publishedAt: { $gte: startDate, $lte: endDate } }
      ]
    }).sort({ scheduledAt: 1 });
    
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur calendrier' });
  }
});

module.exports = router;
