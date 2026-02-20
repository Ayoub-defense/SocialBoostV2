const express = require('express');
const router = express.Router();
const axios = require('axios');

// ─── Route de debug complète ──────────────────────────────────────────────────
// Accessible sur /api/debug - teste tout sans auth
router.get('/', async (req, res) => {
  const results = {};

  // 1. Variables d'environnement
  results.env = {
    NODE_ENV:        process.env.NODE_ENV || 'MANQUANT',
    GROQ_API_KEY:    process.env.GROQ_API_KEY ? `✅ présente (${process.env.GROQ_API_KEY.slice(0,10)}...)` : '❌ MANQUANTE',
    MONGODB_URI:     process.env.MONGODB_URI ? `✅ présente` : '❌ MANQUANTE',
    JWT_SECRET:      process.env.JWT_SECRET && process.env.JWT_SECRET !== 'un_truc_long_et_random' ? '✅ OK' : '⚠️ valeur par défaut',
  };

  // 2. Test Groq
  try {
    const groqRes = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        max_tokens: 20,
        messages: [{ role: 'user', content: 'Dis juste "OK"' }]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );
    results.groq = {
      status: '✅ Groq fonctionne',
      response: groqRes.data.choices[0].message.content
    };
  } catch (e) {
    results.groq = {
      status: '❌ Groq en erreur',
      httpStatus: e.response?.status,
      error: e.response?.data?.error?.message || e.message
    };
  }

  // 3. Test Pollinations
  try {
    const url = 'https://image.pollinations.ai/prompt/test?width=64&height=64&nologo=true';
    await axios.get(url, { timeout: 10000 });
    results.pollinations = { status: '✅ Pollinations accessible' };
  } catch (e) {
    results.pollinations = { status: '❌ Pollinations inaccessible', error: e.message };
  }

  // 4. MongoDB
  const mongoose = require('mongoose');
  results.mongodb = {
    status: mongoose.connection.readyState === 1 ? '✅ Connecté' : '❌ Déconnecté',
    state: mongoose.connection.readyState
  };

  console.log('🔍 DEBUG:', JSON.stringify(results, null, 2));
  res.json(results);
});

module.exports = router;
