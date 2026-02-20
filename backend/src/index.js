const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy:false }));
app.use(compression());
app.use(morgan('combined'));
app.use(cors());

const limiter = rateLimit({ windowMs:15*60*1000, max:200, standardHeaders:true, legacyHeaders:false });
app.use('/api/', limiter);

// Webhook raw body AVANT express.json
app.use('/api/payments/webhook', express.raw({ type:'application/json' }));
app.use(express.json({ limit:'10mb' }));
app.use(express.urlencoded({ extended:true }));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/user',     require('./routes/user'));
app.use('/api/ai',       require('./routes/ai'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/debug',    require('./routes/debug'));

app.get('/api/health', (req, res) => res.json({ status:'OK', app:'SocialBoost AI', v:'2.0.0' }));

// Frontend
const frontendPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(frontendPath));
app.get('*', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode||500).json({ success:false, error:err.message||'Erreur serveur' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log('✅ MongoDB connecté'); app.listen(PORT, () => console.log(`🚀 SocialBoost AI v2 sur port ${PORT}`)); })
  .catch(err => { console.error('❌ MongoDB:', err); process.exit(1); });

module.exports = app;
