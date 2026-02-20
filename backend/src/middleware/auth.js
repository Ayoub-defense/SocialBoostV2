const jwt = require('jsonwebtoken');
const User = require('../models/User');

const PLAN_LEVEL = { free:0, starter:1, pro:2, agency:3 };
const PLAN_LIMITS = { free:3, starter:50, pro:-1, agency:-1 };

const FEATURE_PLANS = {
  'caption':'free', 'hashtags':'free', 'caption-full':'free',
  'promo':'free', 'review-reply':'free',
  'week':'starter', 'bio':'starter', 'video-script':'starter',
  'image':'starter', 'story-sequence':'starter', 'persona':'starter',
  'ideas30':'pro', 'comment-replies':'pro', 'strategy90':'pro',
  'launch-plan':'pro', 'reengagement-email':'pro',
  'competitor-strategy':'pro', 'simulate-client':'pro',
  'audit-bio':'agency', 'post-series':'agency',
  'translate':'agency', 'viral-hook':'agency',
};

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ success:false, error:'Accès non autorisé' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success:false, error:'Utilisateur introuvable' });
    if (user.isBanned) return res.status(403).json({ success:false, error:'Compte suspendu. Contactez le support.', code:'BANNED' });
    req.user = user;
    next();
  } catch(e) {
    if (e.name==='TokenExpiredError') return res.status(401).json({ success:false, error:'Token expiré', code:'TOKEN_EXPIRED' });
    return res.status(401).json({ success:false, error:'Token invalide' });
  }
};

const requireAdmin = async (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ success:false, error:'Accès admin requis' });
  next();
};

const checkFeature = (feature) => async (req, res, next) => {
  const user = req.user;
  const plan = user.subscription?.plan || 'free';
  const status = user.subscription?.status;
  const grantedByAdmin = user.subscription?.grantedByAdmin;
  const requiredPlan = FEATURE_PLANS[feature] || 'free';

  const isActive = status === 'active' || status === 'trialing' || grantedByAdmin;
  const hasAccess = plan === 'free'
    ? requiredPlan === 'free'
    : isActive && PLAN_LEVEL[plan] >= PLAN_LEVEL[requiredPlan];

  if (!hasAccess) return res.status(403).json({ success:false, error:`Plan ${requiredPlan} requis`, code:'PLAN_REQUIRED', requiredPlan, currentPlan:plan });

  const limit = PLAN_LIMITS[plan];
  if (limit !== -1) {
    const now = new Date();
    const lastReset = user.usage?.monthlyReset;
    const needsReset = !lastReset || now.getMonth()!==lastReset.getMonth() || now.getFullYear()!==lastReset.getFullYear();
    if (needsReset) await User.findByIdAndUpdate(user._id, { 'usage.postsGenerated':0, 'usage.monthlyReset':now });
    else if ((user.usage?.postsGenerated||0) >= limit)
      return res.status(403).json({ success:false, error:`Limite mensuelle atteinte (${limit}/mois)`, code:'LIMIT_REACHED', limit, used:user.usage.postsGenerated });
  }
  await User.findByIdAndUpdate(user._id, { $inc:{ 'usage.postsGenerated':1 } });
  next();
};

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id:userId }, process.env.JWT_SECRET, { expiresIn:'7d' });
  const refreshToken = jwt.sign({ id:userId }, process.env.JWT_REFRESH_SECRET, { expiresIn:'30d' });
  return { accessToken, refreshToken };
};

module.exports = { protect, requireAdmin, checkFeature, generateTokens, PLAN_LEVEL, PLAN_LIMITS, FEATURE_PLANS };
