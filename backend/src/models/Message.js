const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['instagram', 'tiktok'] },
  
  // Message reçu
  senderId: String,
  senderUsername: String,
  content: String,
  receivedAt: Date,
  
  // Analyse IA
  intent: { type: String, enum: ['question', 'complaint', 'compliment', 'urgent', 'spam', 'other'] },
  isUrgent: { type: Boolean, default: false },
  urgencyScore: { type: Number, min: 0, max: 10, default: 0 },
  
  // Réponse
  replied: { type: Boolean, default: false },
  replyContent: String,
  repliedAt: Date,
  replyType: { type: String, enum: ['auto', 'manual'] },
  
}, { timestamps: true });

// Templates de réponse auto
const replyTemplateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  trigger: { type: String, required: true }, // mot-clé déclencheur
  response: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  useCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = {
  Message: mongoose.model('Message', messageSchema),
  ReplyTemplate: mongoose.model('ReplyTemplate', replyTemplateSchema)
};
