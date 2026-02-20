const express = require('express');
const router = express.Router();
const { protect, checkFeature } = require('../middleware/auth');
const {
  generateCaption, generateHashtags, generateWeekContent,
  generateBio, generateVideoScript, generate30Ideas,
  generateCommentReplies, buildImageUrl,
  auditBio, generatePostSeries, translatePost, generateViralHooks
} = require('../services/aiService');

const handle = (fn) => async (req, res) => {
  try {
    const result = await fn(req);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('AI Error:', err.message, err.response?.data);
    const msg = err.message.includes('GROQ_API_KEY') ? 'Clé API Groq manquante'
      : err.message.includes('invalide') ? 'Réponse IA invalide, réessayez'
      : err.message.includes('timeout') ? 'Délai dépassé, réessayez'
      : 'Erreur de génération, réessayez';
    res.status(500).json({ success: false, error: msg });
  }
};

// ── FREE ──────────────────────────────────────────────────────────────────────
router.post('/caption', protect, checkFeature('caption'), handle(async (req) => {
  const { topic, platform='instagram', tone='professional', businessType='' } = req.body;
  if (!topic?.trim()) throw new Error('Sujet requis');
  return { caption: await generateCaption({ topic, platform, tone, businessType }) };
}));

router.post('/hashtags', protect, checkFeature('hashtags'), handle(async (req) => {
  const { topic, platform='instagram', businessType='' } = req.body;
  if (!topic?.trim()) throw new Error('Sujet requis');
  return { hashtags: await generateHashtags({ topic, platform, businessType }) };
}));

router.post('/caption-full', protect, checkFeature('caption-full'), handle(async (req) => {
  const { topic, platform='instagram', tone='professional', businessType='' } = req.body;
  if (!topic?.trim()) throw new Error('Sujet requis');
  const [caption, hashtags] = await Promise.all([
    generateCaption({ topic, platform, tone, businessType }),
    generateHashtags({ topic, platform, businessType })
  ]);
  return { caption, hashtags };
}));

// ── STARTER ───────────────────────────────────────────────────────────────────
router.post('/week', protect, checkFeature('week'), handle(async (req) => {
  const { businessType, platform='instagram', tone='professional' } = req.body;
  if (!businessType?.trim()) throw new Error('Business requis');
  return { week: await generateWeekContent({ businessType, platform, tone }) };
}));

router.post('/bio', protect, checkFeature('bio'), handle(async (req) => {
  const { businessType, platform='instagram', tone='professional' } = req.body;
  if (!businessType?.trim()) throw new Error('Business requis');
  const raw = await generateBio({ businessType, platform, tone });
  const bios = typeof raw === 'string' ? JSON.parse(raw.replace(/```json|```/g,'').trim()) : raw;
  return { bios };
}));

router.post('/video-script', protect, checkFeature('video-script'), handle(async (req) => {
  const { topic, businessType, duration=30 } = req.body;
  if (!topic?.trim() || !businessType?.trim()) throw new Error('Topic et business requis');
  const script = await generateVideoScript({ topic, businessType, duration });
  if (!script) throw new Error('Réponse IA invalide, réessayez');
  return { script };
}));

router.post('/image', protect, checkFeature('image'), handle(async (req) => {
  const { prompt, width=1080, height=1080 } = req.body;
  if (!prompt?.trim()) throw new Error('Prompt requis');
  return { imageUrl: buildImageUrl(prompt, width, height) };
}));

// ── PRO ───────────────────────────────────────────────────────────────────────
router.post('/ideas30', protect, checkFeature('ideas30'), handle(async (req) => {
  const { businessType, platform='instagram' } = req.body;
  if (!businessType?.trim()) throw new Error('Business requis');
  const ideas = await generate30Ideas({ businessType, platform });
  if (!ideas) throw new Error('Réponse IA invalide, réessayez');
  return { ideas };
}));

router.post('/comment-replies', protect, checkFeature('comment-replies'), handle(async (req) => {
  const { businessType, commentType='positive' } = req.body;
  if (!businessType?.trim()) throw new Error('Business requis');
  const replies = await generateCommentReplies({ businessType, commentType });
  if (!replies) throw new Error('Réponse IA invalide, réessayez');
  return { replies };
}));

// ── AGENCY ────────────────────────────────────────────────────────────────────
router.post('/audit-bio', protect, checkFeature('audit-bio'), handle(async (req) => {
  const { bio, platform='instagram', businessType='' } = req.body;
  if (!bio?.trim()) throw new Error('Bio requise');
  const result = await auditBio({ bio, platform, businessType });
  if (!result) throw new Error('Réponse IA invalide, réessayez');
  return { audit: result };
}));

router.post('/post-series', protect, checkFeature('post-series'), handle(async (req) => {
  const { topic, businessType, platform='instagram' } = req.body;
  if (!topic?.trim() || !businessType?.trim()) throw new Error('Topic et business requis');
  const series = await generatePostSeries({ topic, businessType, platform });
  if (!series) throw new Error('Réponse IA invalide, réessayez');
  return { series };
}));

router.post('/translate', protect, checkFeature('translate'), handle(async (req) => {
  const { caption, hashtags, targetLang } = req.body;
  if (!caption?.trim() || !targetLang) throw new Error('Caption et langue requis');
  const result = await translatePost({ caption, hashtags, targetLang });
  if (!result) throw new Error('Réponse IA invalide, réessayez');
  return { translated: result };
}));

router.post('/viral-hooks', protect, checkFeature('viral-hook'), handle(async (req) => {
  const { topic, platform='instagram', count=10 } = req.body;
  if (!topic?.trim()) throw new Error('Topic requis');
  const hooks = await generateViralHooks({ topic, platform, count });
  if (!hooks) throw new Error('Réponse IA invalide, réessayez');
  return { hooks };
}));

// ── Info plan utilisateur ─────────────────────────────────────────────────────
router.get('/my-plan', protect, (req, res) => {
  const { PLAN_LIMITS } = require('../middleware/auth');
  const plan = req.user.subscription?.plan || 'free';
  const limit = PLAN_LIMITS[plan];
  const used = req.user.usage?.postsGenerated || 0;
  res.json({
    success: true,
    plan,
    status: req.user.subscription?.status || 'inactive',
    used,
    limit,
    remaining: limit === -1 ? '∞' : Math.max(0, limit - used)
  });
});

module.exports = router;

// ── NOUVELLES ROUTES ──────────────────────────────────────────────────────────
const {
  analyzeTrends, generateCalendar30, generatePersona,
  generateStrategy90, optimizeProfile, generateOffer,
  generateStories, analyzePost
} = require('../services/aiService');

router.post('/trends', protect, checkFeature('ideas30'), handle(async (req) => {
  const { niche, platform='instagram' } = req.body;
  if (!niche?.trim()) throw new Error('Niche requise');
  const trends = await analyzeTrends({ niche, platform });
  if (!trends) throw new Error('Réponse IA invalide, réessayez');
  return { trends };
}));

router.post('/calendar30', protect, checkFeature('ideas30'), handle(async (req) => {
  const { businessType, platform='instagram', tone='professional' } = req.body;
  if (!businessType?.trim()) throw new Error('Business requis');
  const calendar = await generateCalendar30({ businessType, platform, tone });
  if (!calendar) throw new Error('Réponse IA invalide, réessayez');
  return { calendar };
}));

router.post('/persona', protect, checkFeature('ideas30'), handle(async (req) => {
  const { businessType, platform='instagram' } = req.body;
  if (!businessType?.trim()) throw new Error('Business requis');
  const persona = await generatePersona({ businessType, platform });
  if (!persona) throw new Error('Réponse IA invalide, réessayez');
  return { persona };
}));

router.post('/strategy90', protect, checkFeature('pro'), handle(async (req) => {
  const { businessType, platform='instagram', goal='gagner des abonnés' } = req.body;
  if (!businessType?.trim()) throw new Error('Business requis');
  const strategy = await generateStrategy90({ businessType, platform, goal });
  if (!strategy) throw new Error('Réponse IA invalide, réessayez');
  return { strategy };
}));

router.post('/optimize-profile', protect, checkFeature('pro'), handle(async (req) => {
  const { username, bio, platform='instagram', businessType='' } = req.body;
  if (!bio?.trim()) throw new Error('Bio requise');
  const result = await optimizeProfile({ username, bio, platform, businessType });
  if (!result) throw new Error('Réponse IA invalide, réessayez');
  return { profile: result };
}));

router.post('/offer', protect, checkFeature('starter'), handle(async (req) => {
  const { businessType, productService, discount, platform='instagram' } = req.body;
  if (!businessType?.trim() || !productService?.trim()) throw new Error('Business et produit requis');
  const offer = await generateOffer({ businessType, productService, discount: discount||'promo', platform });
  if (!offer) throw new Error('Réponse IA invalide, réessayez');
  return { offer };
}));

router.post('/stories', protect, checkFeature('starter'), handle(async (req) => {
  const { topic, businessType, goal='vendre' } = req.body;
  if (!topic?.trim() || !businessType?.trim()) throw new Error('Topic et business requis');
  const stories = await generateStories({ topic, businessType, goal });
  if (!stories) throw new Error('Réponse IA invalide, réessayez');
  return { stories };
}));

router.post('/analyze-post', protect, checkFeature('pro'), handle(async (req) => {
  const { caption, hashtags, platform='instagram', businessType='' } = req.body;
  if (!caption?.trim()) throw new Error('Caption requise');
  const analysis = await analyzePost({ caption, hashtags, platform, businessType });
  if (!analysis) throw new Error('Réponse IA invalide, réessayez');
  return { analysis };
}));

// ─── Nouveaux outils métier ───────────────────────────────────────────────────
const {
  generatePromo, generateGoogleReply, generateStorySequence,
  generateFidelityProgram, generateEmailMarketing, detectTrends,
  generateSalesPitch, generateCalendar30, generateCallScript
} = require('../services/aiService');

router.post('/promo', protect, checkFeature('ideas30'), handle(async (req) => {
  const { businessType, offer, discount, deadline, platform='instagram' } = req.body;
  if (!businessType?.trim() || !offer?.trim()) throw new Error('Business et offre requis');
  const result = await generatePromo({ businessType, offer, discount, deadline, platform });
  if (!result) throw new Error('Réponse IA invalide');
  return { promo: result };
}));

router.post('/google-reply', protect, checkFeature('comment-replies'), handle(async (req) => {
  const { businessType, reviewText, rating=5, replyTone='professionnelle' } = req.body;
  if (!businessType?.trim() || !reviewText?.trim()) throw new Error('Business et avis requis');
  const replies = await generateGoogleReply({ businessType, reviewText, rating, replyTone });
  if (!replies) throw new Error('Réponse IA invalide');
  return { replies };
}));

router.post('/story-sequence', protect, checkFeature('video-script'), handle(async (req) => {
  const { businessType, topic, goal='engagement', platform='instagram' } = req.body;
  if (!businessType?.trim() || !topic?.trim()) throw new Error('Business et sujet requis');
  const stories = await generateStorySequence({ businessType, topic, goal, platform });
  if (!stories) throw new Error('Réponse IA invalide');
  return { stories };
}));

router.post('/fidelity', protect, checkFeature('post-series'), handle(async (req) => {
  const { businessType, programName='VIP Club', reward } = req.body;
  if (!businessType?.trim()) throw new Error('Business requis');
  const program = await generateFidelityProgram({ businessType, programName, reward });
  if (!program) throw new Error('Réponse IA invalide');
  return { program };
}));

router.post('/email', protect, checkFeature('ideas30'), handle(async (req) => {
  const { businessType, subject, goal='vendre', targetAudience } = req.body;
  if (!businessType?.trim() || !subject?.trim()) throw new Error('Business et sujet requis');
  const email = await generateEmailMarketing({ businessType, subject, goal, targetAudience });
  if (!email) throw new Error('Réponse IA invalide');
  return { email };
}));

router.post('/trends', protect, checkFeature('ideas30'), handle(async (req) => {
  const { niche, platform='instagram' } = req.body;
  if (!niche?.trim()) throw new Error('Niche requise');
  const trends = await detectTrends({ niche, platform });
  if (!trends) throw new Error('Réponse IA invalide');
  return { trends };
}));

router.post('/sales-pitch', protect, checkFeature('post-series'), handle(async (req) => {
  const { productName, businessType, targetAudience, price, uniqueValue } = req.body;
  if (!productName?.trim() || !businessType?.trim()) throw new Error('Produit et business requis');
  const pitch = await generateSalesPitch({ productName, businessType, targetAudience, price, uniqueValue });
  if (!pitch) throw new Error('Réponse IA invalide');
  return { pitch };
}));

router.post('/calendar30', protect, checkFeature('ideas30'), handle(async (req) => {
  const { businessType, platform='instagram', goals='croissance audience' } = req.body;
  if (!businessType?.trim()) throw new Error('Business requis');
  const calendar = await generateCalendar30({ businessType, platform, goals });
  if (!calendar) throw new Error('Réponse IA invalide');
  return { calendar };
}));

router.post('/call-script', protect, checkFeature('comment-replies'), handle(async (req) => {
  const { businessType, callType='relance client inactif', clientProfile } = req.body;
  if (!businessType?.trim()) throw new Error('Business requis');
  const script = await generateCallScript({ businessType, callType, clientProfile });
  if (!script) throw new Error('Réponse IA invalide');
  return { script };
}));

// ── NOUVELLES ROUTES MÉTIER ────────────────────────────────────────────────────
const {
  generatePromo, generateStrategy90, generatePersona, simulateClientChat,
  generateReviewReply, generateStorySequence, generateReEngagementEmail,
  generateLaunchPlan, generateCompetitorStrategy
} = require('../services/aiService');

router.post('/promo', protect, checkFeature('caption'), handle(async (req) => {
  const { businessType, promoType='Soldes', discount='-20%', deadline='ce week-end', platform='instagram' } = req.body;
  if (!businessType?.trim()) throw new Error('Business requis');
  const promo = await generatePromo({ businessType, promoType, discount, deadline, platform });
  if (!promo) throw new Error('Réponse IA invalide');
  return { promo };
}));

router.post('/strategy90', protect, checkFeature('week'), handle(async (req) => {
  const { businessType, goal='Gagner des followers et des clients', platform='instagram' } = req.body;
  if (!businessType?.trim()) throw new Error('Business requis');
  const strategy = await generateStrategy90({ businessType, goal, platform });
  if (!strategy) throw new Error('Réponse IA invalide');
  return { strategy };
}));

router.post('/persona', protect, checkFeature('week'), handle(async (req) => {
  const { businessType, platform='instagram' } = req.body;
  if (!businessType?.trim()) throw new Error('Business requis');
  const persona = await generatePersona({ businessType, platform });
  if (!persona) throw new Error('Réponse IA invalide');
  return { persona };
}));

router.post('/simulate-client', protect, checkFeature('ideas30'), handle(async (req) => {
  const { businessType, persona, history=[], userMessage } = req.body;
  if (!businessType?.trim() || !userMessage?.trim()) throw new Error('Business et message requis');
  const reply = await simulateClientChat({ businessType, persona, history, userMessage });
  return { reply };
}));

router.post('/review-reply', protect, checkFeature('caption'), handle(async (req) => {
  const { businessType, reviewText, rating=5, tone='professionnel' } = req.body;
  if (!businessType?.trim() || !reviewText?.trim()) throw new Error('Business et avis requis');
  const replies = await generateReviewReply({ businessType, reviewText, rating, tone });
  if (!replies) throw new Error('Réponse IA invalide');
  return { replies };
}));

router.post('/story-sequence', protect, checkFeature('week'), handle(async (req) => {
  const { businessType, goal='Vendre mon produit', platform='instagram' } = req.body;
  if (!businessType?.trim()) throw new Error('Business requis');
  const stories = await generateStorySequence({ businessType, goal, platform });
  if (!stories) throw new Error('Réponse IA invalide');
  return { stories };
}));

router.post('/reengagement-email', protect, checkFeature('pro'), handle(async (req) => {
  const { businessType, inactiveSince='3 mois', offer='' } = req.body;
  if (!businessType?.trim()) throw new Error('Business requis');
  const email = await generateReEngagementEmail({ businessType, inactiveSince, offer });
  if (!email) throw new Error('Réponse IA invalide');
  return { email };
}));

router.post('/launch-plan', protect, checkFeature('pro'), handle(async (req) => {
  const { businessType, productName, launchDate='dans 2 semaines', platform='instagram' } = req.body;
  if (!businessType?.trim() || !productName?.trim()) throw new Error('Business et produit requis');
  const plan = await generateLaunchPlan({ businessType, productName, launchDate, platform });
  if (!plan) throw new Error('Réponse IA invalide');
  return { plan };
}));

router.post('/competitor-strategy', protect, checkFeature('pro'), handle(async (req) => {
  const { businessType, competitorType, platform='instagram' } = req.body;
  if (!businessType?.trim() || !competitorType?.trim()) throw new Error('Business et concurrent requis');
  const strategy = await generateCompetitorStrategy({ businessType, competitorType, platform });
  if (!strategy) throw new Error('Réponse IA invalide');
  return { strategy };
}));
