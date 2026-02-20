const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Contenu
  platform: { type: String, enum: ['instagram', 'tiktok', 'both'], required: true },
  caption: { type: String, required: true, maxlength: 2200 },
  hashtags: [{ type: String }],
  mediaUrl: String,
  mediaType: { type: String, enum: ['image', 'video', 'carousel'] },
  
  // Génération IA
  aiGenerated: { type: Boolean, default: false },
  topic: String,
  tone: String,
  
  // Planification
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed', 'cancelled'],
    default: 'draft'
  },
  scheduledAt: Date,
  publishedAt: Date,
  
  // Résultats API réseaux sociaux
  socialPostId: String,
  publishError: String,
  
  // Analytics (mis à jour périodiquement)
  analytics: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 }
  }
  
}, { timestamps: true });

postSchema.index({ user: 1, status: 1 });
postSchema.index({ scheduledAt: 1, status: 1 });

module.exports = mongoose.model('Post', postSchema);
