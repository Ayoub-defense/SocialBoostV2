const axios = require('axios');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const groq = async (systemPrompt, userPrompt, maxTokens = 1000) => {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY manquante');
  console.log('Groq call | key:', process.env.GROQ_API_KEY.slice(0, 15) + '...');
  const res = await axios.post(GROQ_URL, {
    model: MODEL, max_tokens: maxTokens, temperature: 0.8,
    messages: [{ role:'system', content:systemPrompt }, { role:'user', content:userPrompt }]
  }, { headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 30000 });
  return res.data.choices[0].message.content.trim();
};

const parseJSON = (text) => {
  let c = text.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim();
  try { return JSON.parse(c); } catch {}
  try { const m=c.match(/\[[\s\S]*\]/); if(m) return JSON.parse(m[0]); } catch {}
  try { const m=c.match(/\{[\s\S]*\}/); if(m) return JSON.parse(m[0]); } catch {}
  return null;
};

const buildImageUrl = (prompt, w=1080, h=1080) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&enhance=true`;

const generateCaption = async ({ topic, platform, tone, businessType }) => {
  const t = { professional:'professionnel', fun:'fun et dynamique', luxury:'luxueux', young:'jeune', neutral:'neutre' };
  return groq(`Expert contenu ${platform}. Réponds en français. Génère UNIQUEMENT la légende, sans hashtags.`,
    `Légende ${platform} pour "${businessType||'un business'}" sur: "${topic}". Ton: ${t[tone]||'neutre'}. Max 150 mots. Avec emojis.`, 500);
};

const generateHashtags = async ({ topic, platform, businessType }) => {
  const raw = await groq(`Expert SEO ${platform}. Réponds en français.`,
    `20 hashtags ${platform} pour "${businessType||'un business'}" sur "${topic}". Mix populaires/moyens/niche. JSON: ["h1","h2"]`, 400);
  return parseJSON(raw) || [];
};

const generateWeekContent = async ({ businessType, platform, tone }) => {
  const raw = await groq(`Stratège contenu ${platform}. Réponds en français.`,
    `7 posts ${platform} pour "${businessType}". Ton: ${tone}. JSON: [{"day":1,"dayName":"Lundi","theme":"...","caption":"...","hashtags":["h1","h2","h3","h4","h5"],"bestTime":"HH:MM"}]`, 2500);
  return parseJSON(raw);
};

const generateBio = async ({ businessType, platform, tone }) => {
  return groq(`Expert personal branding ${platform}. Réponds en français.`,
    `3 bios ${platform} pour "${businessType}" ton ${tone}. Max 150 car. Emoji + CTA. JSON: [{"style":"Pro","bio":"..."},{"style":"Créative","bio":"..."},{"style":"Minimaliste","bio":"..."}]`, 600);
};

const generateVideoScript = async ({ topic, businessType, duration=30 }) => {
  const raw = await groq(`Créateur TikTok viral. Réponds en français.`,
    `Script TikTok ${duration}s sur "${topic}" pour "${businessType}". JSON: {"hook":"accroche 0-3s","content":"développement","cta":"call to action","visualTips":["t1","t2","t3"],"hashtags":["h1","h2","h3","h4","h5"]}`, 800);
  return parseJSON(raw);
};

const generate30Ideas = async ({ businessType, platform }) => {
  const raw = await groq(`Stratège contenu réseaux. Réponds en français.`,
    `30 idées posts ${platform} pour "${businessType}". 5 par catégorie: Éducatif, Coulisses, Promotion, Engagement, Inspiration/Motivation, Tendance/Actualité. JSON: [{"id":1,"category":"Éducatif","title":"titre","hook":"première phrase"}]`, 2500);
  return parseJSON(raw);
};

const generateCommentReplies = async ({ businessType, commentType }) => {
  const types = { positive:'compliments', negative:'critiques', question:'questions produit', price:'questions prix', shipping:'questions livraison' };
  const raw = await groq(`Community manager de "${businessType}". Réponds en français.`,
    `5 réponses types aux ${types[commentType]||'commentaires'}. Naturelles, 1-3 phrases, émojis si approprié. JSON: [{"reply":"...","note":"quand utiliser"}]`, 800);
  return parseJSON(raw);
};

const generatePromo = async ({ businessType, promoType, discount, deadline, platform }) => {
  const raw = await groq(`Expert marketing copywriting. Réponds en français.`,
    `Promo complète "${businessType}". Type:${promoType} Réduction:${discount} Deadline:${deadline} Plateforme:${platform}. JSON: {"headline":"titre","subheadline":"sous-titre","caption":"légende avec emojis","conditions":"1 phrase","cta":"call-to-action","storyText":"texte story","hashtags":["h1","h2","h3","h4","h5"],"urgencyPhrase":"urgence","bestPostTime":"moment"}`, 900);
  return parseJSON(raw);
};

const generateStrategy90 = async ({ businessType, goal, platform }) => {
  const raw = await groq(`Consultant stratégie digitale PME. Réponds en français.`,
    `Plan contenu 90 jours "${businessType}", objectif:"${goal}" sur ${platform}. JSON: {"overview":"vision","kpis":["k1","k2","k3"],"months":[{"month":1,"theme":"...","objective":"...","weeks":[{"week":1,"focus":"...","contentTypes":["t1"],"postFrequency":"X/sem"},{"week":2,"focus":"...","contentTypes":["t1"],"postFrequency":"X/sem"},{"week":3,"focus":"...","contentTypes":["t1"],"postFrequency":"X/sem"},{"week":4,"focus":"...","contentTypes":["t1"],"postFrequency":"X/sem"}]},{"month":2,"theme":"...","objective":"...","weeks":[{"week":1,"focus":"...","contentTypes":["t1"],"postFrequency":"X/sem"},{"week":2,"focus":"...","contentTypes":["t1"],"postFrequency":"X/sem"},{"week":3,"focus":"...","contentTypes":["t1"],"postFrequency":"X/sem"},{"week":4,"focus":"...","contentTypes":["t1"],"postFrequency":"X/sem"}]},{"month":3,"theme":"...","objective":"...","weeks":[{"week":1,"focus":"...","contentTypes":["t1"],"postFrequency":"X/sem"},{"week":2,"focus":"...","contentTypes":["t1"],"postFrequency":"X/sem"},{"week":3,"focus":"...","contentTypes":["t1"],"postFrequency":"X/sem"},{"week":4,"focus":"...","contentTypes":["t1"],"postFrequency":"X/sem"}]}],"tips":["t1","t2","t3"]}`, 2000);
  return parseJSON(raw);
};

const generatePersona = async ({ businessType, platform }) => {
  const raw = await groq(`Expert marketing psychologie consommateur. Réponds en français.`,
    `Persona client idéal "${businessType}" sur ${platform}. JSON: {"name":"prénom","age":"tranche","job":"métier","location":"lieu","income":"revenus","bio":"vie 2 phrases","goals":["g1","g2","g3"],"painPoints":["p1","p2","p3"],"objections":["o1","o2","o3"],"triggers":["t1","t2"],"socialMedia":{"platforms":["p1","p2"],"usage":"usage","bestTime":"quand"},"salesArguments":["a1","a2","a3"],"avoidWords":["m1","m2"],"useWords":["m1","m2","m3"]}`, 1000);
  return parseJSON(raw);
};

const simulateClientChat = async ({ businessType, persona, history, userMessage }) => {
  const hist = history.map(m=>`${m.role==='user'?'Vendeur':'Client'}: ${m.content}`).join('\n');
  return groq(
    `Tu joues un client potentiel de "${businessType}". Persona: ${JSON.stringify(persona)}. Tu as des vraies objections, tu hésites. NE révèle JAMAIS que tu es IA. Réponds en français, naturellement, 1-3 phrases max.`,
    `${hist}\n\nVendeur: ${userMessage}\nClient:`, 300);
};

const generateReviewReply = async ({ businessType, reviewText, rating, tone }) => {
  const raw = await groq(`Gestionnaire réputation "${businessType}". Réponds en français ton ${tone}.`,
    `3 réponses à cet avis Google (${rating}/5): "${reviewText}". JSON: [{"style":"Chaleureuse","reply":"..."},{"style":"Professionnelle","reply":"..."},{"style":"Personnalisée","reply":"..."}]`, 700);
  return parseJSON(raw);
};

const generateStorySequence = async ({ businessType, goal, platform }) => {
  const raw = await groq(`Expert Stories ${platform} qui convertissent. Réponds en français.`,
    `Séquence 5 Stories "${businessType}", objectif:"${goal}". JSON: [{"slide":1,"type":"Accroche","text":"texte principal","subtext":"texte secondaire","background":"style fond","sticker":"sticker suggéré","tip":"conseil mise en page"}]`, 900);
  return parseJSON(raw);
};

const generateReEngagementEmail = async ({ businessType, inactiveSince, offer }) => {
  const raw = await groq(`Expert email marketing. Réponds en français.`,
    `Email relance clients inactifs depuis "${inactiveSince}" de "${businessType}". Offre:"${offer}". JSON: {"subject":"objet max 50 car","preheader":"preview max 90 car","body":"corps complet avec [PRENOM]","cta":"texte bouton","ps":"post-scriptum"}`, 900);
  return parseJSON(raw);
};

const generateLaunchPlan = async ({ businessType, productName, launchDate, platform }) => {
  const raw = await groq(`Expert lancement produit réseaux sociaux. Réponds en français.`,
    `Plan lancement "${productName}" de "${businessType}" le ${launchDate} sur ${platform}. JSON: {"strategy":"stratégie","phases":[{"phase":"Teaser (J-7 à J-3)","objective":"anticipation","posts":[{"day":"J-7","type":"type","content":"idée","hook":"accroche"},{"day":"J-5","type":"type","content":"idée","hook":"accroche"},{"day":"J-3","type":"type","content":"idée","hook":"accroche"}]},{"phase":"Révélation (J-2 à J0)","objective":"convertir","posts":[{"day":"J-2","type":"type","content":"idée","hook":"accroche"},{"day":"J-1","type":"type","content":"idée","hook":"accroche"},{"day":"J0","type":"type","content":"idée","hook":"accroche"}]},{"phase":"Post-lancement (J+1 à J+7)","objective":"capitaliser","posts":[{"day":"J+1","type":"type","content":"idée","hook":"accroche"},{"day":"J+3","type":"type","content":"idée","hook":"accroche"},{"day":"J+7","type":"type","content":"idée","hook":"accroche"}]}],"hashtags":["h1","h2","h3","h4","h5"],"tips":["t1","t2","t3"]}`, 1500);
  return parseJSON(raw);
};

const generateCompetitorStrategy = async ({ businessType, competitorType, platform }) => {
  const raw = await groq(`Consultant stratégie digitale. Réponds en français.`,
    `Stratégie différenciation vs "${competitorType}" pour "${businessType}" sur ${platform}. JSON: {"competitorWeaknesses":["f1","f2","f3"],"differentiators":["a1","a2","a3"],"contentGaps":["s1","s2","s3"],"contentIdeas":[{"title":"idée","why":"pourquoi"},{"title":"idée2","why":"..."},{"title":"idée3","why":"..."}],"toneAdvice":"conseil ton","actionPlan":["action1","action2","action3"]}`, 900);
  return parseJSON(raw);
};

const auditBio = async ({ bio, platform, businessType }) => {
  const raw = await groq(`Expert personal branding SEO ${platform}. Réponds en français.`,
    `Analyse bio ${platform} pour "${businessType}": "${bio}". JSON: {"score":75,"scoreLabel":"Correct","strengths":["p1","p2"],"weaknesses":["pb1","pb2","pb3"],"improved":"version améliorée","tips":["c1","c2","c3"]}`, 700);
  return parseJSON(raw);
};

const generatePostSeries = async ({ topic, businessType, platform }) => {
  const raw = await groq(`Expert stratégie contenu ${platform}. Réponds en français.`,
    `Série 5 posts ${platform} sur "${topic}" pour "${businessType}". Chaque post = format différent. JSON: [{"format":"Éducatif","title":"titre","caption":"légende complète","hashtags":["h1","h2","h3"]},{"format":"Storytelling","title":"titre","caption":"...","hashtags":["h1","h2","h3"]},{"format":"Liste/Conseils","title":"titre","caption":"...","hashtags":["h1","h2","h3"]},{"format":"Question/Débat","title":"titre","caption":"...","hashtags":["h1","h2","h3"]},{"format":"Témoignage","title":"titre","caption":"...","hashtags":["h1","h2","h3"]}]`, 2000);
  return parseJSON(raw);
};

const translatePost = async ({ caption, hashtags, targetLang }) => {
  const langs = { en:'anglais', es:'espagnol', ar:'arabe', de:'allemand', it:'italien' };
  const raw = await groq(`Traducteur expert marketing réseaux sociaux. Adapte culturellement.`,
    `Traduis en ${langs[targetLang]||targetLang}: "${caption}" | Hashtags: ${hashtags?.join(', ')}. JSON: {"caption":"post traduit adapté","hashtags":["h1","h2","h3"],"culturalNote":"note adaptation"}`, 700);
  return parseJSON(raw);
};

const generateViralHooks = async ({ topic, platform, count=10 }) => {
  const raw = await groq(`Créateur contenu viral ${platform}. Réponds en français.`,
    `${count} hooks ultra-accrocheurs pour "${topic}" sur ${platform}. Techniques: chiffre précis, question provocatrice, contre-intuition, secret, peur de manquer. JSON: [{"hook":"...","technique":"chiffre précis","why":"pourquoi ça marche"}]`, 900);
  return parseJSON(raw);
};

module.exports = {
  generateCaption, generateHashtags, generateWeekContent, generateBio,
  generateVideoScript, generate30Ideas, generateCommentReplies, buildImageUrl,
  generatePromo, generateStrategy90, generatePersona, simulateClientChat,
  generateReviewReply, generateStorySequence, generateReEngagementEmail,
  generateLaunchPlan, generateCompetitorStrategy, auditBio,
  generatePostSeries, translatePost, generateViralHooks,
};
