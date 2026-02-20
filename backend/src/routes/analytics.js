const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Post = require('../models/Post');
const { generateRecommendations } = require('../services/aiService');

// ─── Dashboard stats ──────────────────────────────────────────────────────────
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    
    const [totalPosts, scheduledPosts, publishedPosts, recentPosts] = await Promise.all([
      Post.countDocuments({ user: userId }),
      Post.countDocuments({ user: userId, status: 'scheduled' }),
      Post.countDocuments({ user: userId, status: 'published' }),
      Post.find({ user: userId, createdAt: { $gte: thirtyDaysAgo } })
        .sort({ createdAt: -1 }).limit(50)
    ]);
    
    // Calcul stats globales
    const totalLikes = recentPosts.reduce((s, p) => s + (p.analytics?.likes || 0), 0);
    const totalComments = recentPosts.reduce((s, p) => s + (p.analytics?.comments || 0), 0);
    const totalViews = recentPosts.reduce((s, p) => s + (p.analytics?.views || 0), 0);
    const avgEngagement = recentPosts.length > 0
      ? (recentPosts.reduce((s, p) => s + (p.analytics?.engagementRate || 0), 0) / recentPosts.length).toFixed(2)
      : 0;
    
    // Posts par plateforme
    const instagramPosts = recentPosts.filter(p => p.platform === 'instagram' || p.platform === 'both').length;
    const tiktokPosts = recentPosts.filter(p => p.platform === 'tiktok' || p.platform === 'both').length;
    
    // Top posts
    const topPosts = recentPosts
      .filter(p => p.status === 'published')
      .sort((a, b) => (b.analytics?.engagementRate || 0) - (a.analytics?.engagementRate || 0))
      .slice(0, 5);
    
    // Usage vs limites
    const limits = req.user.getPlanLimits();
    const usage = req.user.usage;
    
    res.json({
      success: true,
      stats: {
        totalPosts, scheduledPosts, publishedPosts,
        totalLikes, totalComments, totalViews, avgEngagement,
        instagramPosts, tiktokPosts
      },
      usage: {
        postsGenerated: usage.postsGenerated || 0,
        postsLimit: limits.postsPerMonth,
        aiReplies: usage.aiRepliesSent || 0
      },
      topPosts,
      plan: req.user.subscription.plan
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, error: 'Erreur analytics' });
  }
});

// ─── Évolution dans le temps ──────────────────────────────────────────────────
router.get('/timeline', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const posts = await Post.find({
      user: req.user._id,
      status: 'published',
      publishedAt: { $gte: startDate }
    }).sort({ publishedAt: 1 });
    
    // Grouper par jour
    const byDay = {};
    posts.forEach(post => {
      const day = post.publishedAt?.toISOString().split('T')[0];
      if (!byDay[day]) byDay[day] = { date: day, posts: 0, likes: 0, views: 0 };
      byDay[day].posts++;
      byDay[day].likes += post.analytics?.likes || 0;
      byDay[day].views += post.analytics?.views || 0;
    });
    
    res.json({ success: true, timeline: Object.values(byDay) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur timeline' });
  }
});

// ─── Recommandations IA ───────────────────────────────────────────────────────
router.get('/recommendations', protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id, status: 'published' })
      .sort({ 'analytics.engagementRate': -1 }).limit(5);
    
    const stats = {
      totalPosts: await Post.countDocuments({ user: req.user._id }),
      avgEngagement: posts.length ? posts.reduce((s, p) => s + (p.analytics?.engagementRate || 0), 0) / posts.length : 0,
      plan: req.user.subscription.plan
    };
    
    const recommendations = await generateRecommendations({ stats, topPosts: posts });
    
    res.json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur recommandations' });
  }
});

module.exports = router;
