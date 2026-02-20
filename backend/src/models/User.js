const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:  { type:String, required:true, trim:true, maxlength:50 },
  email: { type:String, required:true, unique:true, lowercase:true, match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide'] },
  password: { type:String, required:true, minlength:8, select:false },

  // Admin
  isAdmin:    { type:Boolean, default:false },
  adminNote:  { type:String, default:'' },

  // Statut compte
  isBanned:   { type:Boolean, default:false },
  banReason:  { type:String, default:'' },

  // A2F (Google Authenticator)
  twoFA: {
    enabled:    { type:Boolean, default:false },
    secret:     { type:String, select:false },
    verified:   { type:Boolean, default:false },
  },

  // Abonnement
  subscription: {
    plan:               { type:String, enum:['free','starter','pro','agency'], default:'free' },
    status:             { type:String, enum:['active','inactive','canceled','trialing'], default:'inactive' },
    grantedByAdmin:     { type:Boolean, default:false },
    lsSubscriptionId:   String,
    lsCustomerId:       String,
    currentPeriodEnd:   Date,
    cancelAtPeriodEnd:  { type:Boolean, default:false },
  },

  // Paramètres
  settings: {
    tone:          { type:String, enum:['professional','fun','luxury','young','neutral'], default:'professional' },
    language:      { type:String, default:'fr' },
    timezone:      { type:String, default:'Europe/Paris' },
    notifications: { type:Boolean, default:true },
  },

  // Usage mensuel
  usage: {
    postsGenerated: { type:Number, default:0 },
    monthlyReset:   Date,
  },

  // Notifications admin broadcast
  notifications: [{
    message:  String,
    type:     { type:String, enum:['info','success','warning'], default:'info' },
    read:     { type:Boolean, default:false },
    sentAt:   { type:Date, default:Date.now },
  }],

  isVerified:          { type:Boolean, default:false },
  verificationToken:   String,
  resetPasswordToken:  String,
  resetPasswordExpire: Date,
  lastLogin:           Date,
}, { timestamps:true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(pw) {
  return bcrypt.compare(pw, this.password);
};

module.exports = mongoose.model('User', userSchema);
