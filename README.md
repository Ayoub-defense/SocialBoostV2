# ⚡ SocialBoost AI

> Automatisez votre présence Instagram & TikTok grâce à l'IA — Dès 5€/mois

---

## 🚀 Installation rapide (15 minutes)

### Prérequis
- Node.js v18+
- MongoDB (local ou MongoDB Atlas gratuit)
- Compte Stripe (gratuit pour tester)
- Compte Groq (gratuit — https://console.groq.com)

---

### 1. Cloner et installer

```bash
# Backend
cd backend
npm install
cp .env.example .env
# → Remplissez .env avec vos clés

# Frontend
cd ../frontend
npm install
```

---

### 2. Configuration des services GRATUITS

#### 🧠 Groq AI (remplace OpenAI — 100% gratuit)
1. Inscrivez-vous sur https://console.groq.com
2. Créez une clé API gratuite
3. Ajoutez dans `.env` : `GROQ_API_KEY=gsk_...`

**Limites gratuites Groq :**
- 14 400 requêtes/jour
- 6 000 tokens/minute
- Modèle : Llama 3 8B (excellent en français)

#### 💳 Stripe (paiements)
1. Créez un compte gratuit sur https://stripe.com
2. Mode TEST : aucun frais jusqu'à la mise en prod
3. Récupérez vos clés dans le Dashboard Stripe
4. Créez 3 produits dans Stripe :
   - Starter : 5€/mois récurrent
   - Pro : 12€/mois récurrent
   - Agency : 20€/mois récurrent
5. Copiez les Price IDs dans `.env`

#### 🍃 MongoDB Atlas (gratuit jusqu'à 512MB)
1. https://www.mongodb.com/atlas
2. Créez un cluster gratuit M0
3. Récupérez votre URI de connexion

---

### 3. Démarrer en développement

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# → http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm start
# → http://localhost:3000
```

---

### 4. Test carte Stripe (mode développement)
```
Numéro : 4242 4242 4242 4242
Date : n'importe quelle date future
CVC : n'importe quel 3 chiffres
```

---

## 📁 Architecture du projet

```
socialboost-ai/
├── backend/
│   ├── src/
│   │   ├── index.js              # Point d'entrée Express
│   │   ├── models/
│   │   │   ├── User.js           # Utilisateurs + abonnements
│   │   │   ├── Post.js           # Posts générés
│   │   │   └── Message.js        # Messages + templates
│   │   ├── routes/
│   │   │   ├── auth.js           # Inscription/connexion JWT
│   │   │   ├── ai.js             # Génération IA (Groq)
│   │   │   ├── content.js        # CRUD posts
│   │   │   ├── scheduler.js      # Planification + cron
│   │   │   ├── analytics.js      # Statistiques
│   │   │   ├── payments.js       # Stripe abonnements
│   │   │   └── user.js           # Profil utilisateur
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT protect + requirePlan
│   │   └── services/
│   │       └── aiService.js      # Toute la logique IA
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── App.js                # Routes React
    │   ├── context/
    │   │   └── AuthContext.js    # State global auth
    │   ├── utils/
    │   │   └── api.js            # Axios + refresh token auto
    │   ├── components/
    │   │   └── dashboard/
    │   │       └── AppLayout.js  # Sidebar + layout
    │   └── pages/
    │       ├── LandingPage.js    # Page d'accueil conversion
    │       ├── LoginPage.js      # Connexion
    │       ├── RegisterPage.js   # Inscription
    │       ├── Dashboard.js      # Tableau de bord
    │       ├── ContentGenerator.js # Génération IA
    │       ├── Scheduler.js      # Planification
    │       ├── Analytics.js      # Statistiques
    │       ├── Messages.js       # Réponses DM auto
    │       ├── Settings.js       # Paramètres
    │       └── Pricing.js        # Plans + paiement
    └── public/
        └── index.html
```

---

## 💰 Stratégie de pricing

| Plan | Prix | Cible | Marge estimée |
|------|------|-------|----------------|
| Gratuit | 0€ | Acquisition | — |
| Starter | 5€/mois | Indépendants | ~4.50€ |
| Pro | 12€/mois | PME | ~11€ |
| Agency | 20€/mois | Agences | ~18.50€ |

**Coûts opérationnels estimés (pour 100 clients) :**
- Groq AI : 0€ (gratuit)
- MongoDB Atlas : 0€ (M0 gratuit jusqu'à 512MB)
- Hébergement backend : ~5-10€/mois (Railway/Render)
- Hébergement frontend : 0€ (Vercel gratuit)
- Stripe : 1.4% + 0.25€ par transaction

**Point de rentabilité :** ~10 clients Starter ou 5 clients Pro

---

## 🚀 Déploiement production (gratuit/quasi-gratuit)

### Frontend → Vercel (gratuit)
```bash
npm install -g vercel
cd frontend
npm run build
vercel --prod
```

### Backend → Railway (5$/mois crédit offert)
```bash
# Connectez votre repo GitHub à Railway
# Variables d'environnement dans le dashboard Railway
# Auto-deploy sur push
```

### Alternative backend → Render (gratuit avec sleep)
```bash
# render.yaml à la racine du backend
# Connectez GitHub → deploy automatique
```

### MongoDB → Atlas M0 (gratuit)
```
URI: mongodb+srv://user:pass@cluster.mongodb.net/socialboost
```

---

## 🔒 Sécurité

- ✅ JWT tokens avec expiration 7 jours
- ✅ Refresh tokens 30 jours
- ✅ Rate limiting (auth: 10/15min, AI: 20/min)
- ✅ Helmet.js (headers sécurité)
- ✅ Validation des inputs (express-validator)
- ✅ Mots de passe hashés bcrypt (salt 12)
- ✅ CORS configuré
- ✅ Webhook Stripe avec signature

---

## 📈 Textes marketing

### Tagline principale
**"Automatisez. Publiez. Grandissez. Dès 5€/mois."**

### Email de bienvenue
```
Objet: Votre accès SocialBoost AI est prêt ⚡

Bonjour [Nom],

Bienvenue dans la révolution du marketing social !

Votre essai gratuit de 7 jours commence maintenant.
Voici ce que vous pouvez faire dès aujourd'hui :

✨ Générer vos 5 premiers posts IA
📅 Planifier votre semaine en 10 minutes
🤖 Configurer vos réponses automatiques

→ Accéder à mon tableau de bord : [LIEN]

Des questions ? Répondez directement à cet email.

L'équipe SocialBoost AI
```

### Annonce Meta Ads
```
🚫 Stop à 5h/jour sur Instagram pour rien.

SocialBoost AI génère vos posts, répond à vos DM 
et analyse vos stats. Automatiquement.

✓ Légendes optimisées SEO
✓ Hashtags ciblés
✓ Planification intelligente
✓ Réponses IA 24h/24

Dès 5€/mois. 7 jours gratuits.
[Essayer gratuitement →]
```

---

## 🔮 Roadmap (prochaines fonctionnalités)

- [ ] Intégration API Instagram Graph (publication réelle)
- [ ] Intégration API TikTok Content
- [ ] Génération d'images IA (Stable Diffusion local)
- [ ] Templates de stories
- [ ] Rapports PDF automatiques
- [ ] Accès multi-utilisateurs (pour agency)
- [ ] Chrome extension
- [ ] Application mobile React Native

---

## 🆘 Support

En cas de problème :
1. Vérifiez les logs : `npm run dev` dans le backend
2. Vérifiez que MongoDB est démarré
3. Vérifiez votre clé Groq dans `.env`
4. Issues GitHub ou email support
