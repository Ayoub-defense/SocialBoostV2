import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:'#07070e', surface:'#0d0d1a', card:'#111120', cardHover:'#161630',
  border:'rgba(255,255,255,0.06)', borderHi:'rgba(124,92,252,0.3)',
  accent:'#7C5CFC', accentLo:'rgba(124,92,252,0.1)', accentMid:'rgba(124,92,252,0.2)',
  text:'#EEEEFF', muted:'#5a5a8a', subtle:'#2d2d5a',
  green:'#00D68F', red:'#FF5C5C', yellow:'#FFB800', orange:'#FF6B35', pink:'#FF4D8D',
};

const PLAN_LEVEL = { free:0, starter:1, pro:2, agency:3 };
const PLAN_COLOR = { free:C.muted, starter:'#a78bfa', pro:'#8b5cf6', agency:'#FFB800' };
const PLAN_LABEL = { free:'Free', starter:'Starter', pro:'Pro', agency:'Agency' };

// ─── Atoms ────────────────────────────────────────────────────────────────────
const Lbl = ({ children }) => (
  <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:8 }}>{children}</div>
);

const Inp = ({ label, multiline, ...p }) => {
  const base = { width:'100%', padding:'12px 14px', background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, borderRadius:11, color:C.text, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', transition:'border-color .15s' };
  const handlers = { onFocus:e=>e.target.style.borderColor=C.borderHi, onBlur:e=>e.target.style.borderColor=C.border };
  return (
    <div style={{ marginBottom:14 }}>
      {label && <Lbl>{label}</Lbl>}
      {multiline ? <textarea {...p} {...handlers} style={{ ...base, resize:'vertical', minHeight:80, ...p.style }} /> : <input {...p} {...handlers} style={{ ...base, ...p.style }} />}
    </div>
  );
};

const Btn = ({ loading, icon, children, variant='primary', small, ...p }) => {
  const v = {
    primary:   { bg:'linear-gradient(135deg,#7C5CFC,#5a40d4)', color:'#fff', border:'none', shadow:'0 4px 18px rgba(124,92,252,0.35)' },
    secondary: { bg:C.accentLo, color:'#c4b5fd', border:`1px solid ${C.borderHi}`, shadow:'none' },
    ghost:     { bg:'rgba(255,255,255,0.04)', color:C.muted, border:`1px solid ${C.border}`, shadow:'none' },
    success:   { bg:'rgba(0,214,143,0.12)', color:C.green, border:'1px solid rgba(0,214,143,0.3)', shadow:'none' },
    danger:    { bg:'rgba(255,92,92,0.1)', color:C.red, border:'1px solid rgba(255,92,92,0.3)', shadow:'none' },
  }[variant] || {};
  return (
    <button {...p} disabled={p.disabled||loading} style={{ display:'inline-flex', alignItems:'center', gap:7, padding:small?'7px 14px':'11px 20px', borderRadius:10, border:v.border, background:v.bg, color:v.color, cursor:p.disabled||loading?'not-allowed':'pointer', fontSize:small?12:14, fontWeight:700, fontFamily:'inherit', opacity:p.disabled||loading?0.5:1, boxShadow:v.shadow, transition:'all .2s', ...p.style }}>
      {loading ? <i className="fa-solid fa-spinner fa-spin" style={{ fontSize:12 }} /> : icon && <i className={`fa-solid ${icon}`} style={{ fontSize:small?11:13 }} />}
      <span>{loading?'Génération...':children}</span>
    </button>
  );
};

const Card = ({ children, glow, style }) => (
  <div style={{ background:C.card, border:`1px solid ${glow?C.borderHi:C.border}`, borderRadius:16, padding:'20px', boxShadow:glow?'0 0 28px rgba(124,92,252,0.07)':'none', ...style }}>{children}</div>
);

const Chip = ({ active, onClick, children, color }) => (
  <button onClick={onClick} style={{ padding:'6px 13px', borderRadius:999, border:`1px solid ${active?(color||C.borderHi):C.border}`, background:active?(color?color+'18':C.accentLo):'transparent', color:active?(color||'#c4b5fd'):C.muted, cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'inherit', transition:'all .15s', whiteSpace:'nowrap' }}>{children}</button>
);

const Tag = ({ children }) => (
  <span style={{ display:'inline-block', padding:'3px 9px', background:C.accentLo, border:`1px solid ${C.accentMid}`, borderRadius:999, color:'#a89fff', fontSize:11, margin:'2px', fontWeight:600 }}>#{children}</span>
);

const Alert = ({ type='info', icon, children }) => {
  const col = { error:C.red, success:C.green, info:C.accent, warning:C.yellow };
  const bg  = { error:'rgba(255,92,92,0.07)', success:'rgba(0,214,143,0.07)', info:C.accentLo, warning:'rgba(255,184,0,0.07)' };
  const ic  = { error:'fa-circle-exclamation', success:'fa-circle-check', info:'fa-circle-info', warning:'fa-triangle-exclamation' };
  return (
    <div style={{ display:'flex', gap:9, padding:'11px 14px', borderRadius:10, border:`1px solid ${col[type]}28`, background:bg[type], color:col[type], fontSize:13, marginTop:10, lineHeight:1.5 }}>
      <i className={`fa-solid ${icon||ic[type]}`} style={{ marginTop:1, flexShrink:0, fontSize:13 }} />
      <span>{children}</span>
    </div>
  );
};

function CopyBtn({ text, label }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={()=>{ navigator.clipboard.writeText(text); setOk(true); setTimeout(()=>setOk(false),2000); }}
      style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 11px', borderRadius:8, border:`1px solid ${ok?'rgba(0,214,143,0.4)':C.borderHi}`, background:ok?'rgba(0,214,143,0.1)':C.accentLo, color:ok?C.green:'#a89fff', cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:'inherit', transition:'all .2s' }}>
      <i className={`fa-solid ${ok?'fa-check':'fa-copy'}`} style={{ fontSize:10 }} />
      {ok?'Copié !':(label||'Copier')}
    </button>
  );
}

function PlanLock({ req, cur, children }) {
  if (PLAN_LEVEL[cur] >= PLAN_LEVEL[req]) return children;
  const col = { starter:'#a78bfa', pro:'#8b5cf6', agency:'#FFB800' };
  const ic  = { starter:'fa-bolt', pro:'fa-fire', agency:'fa-crown' };
  return (
    <div style={{ position:'relative', borderRadius:16, overflow:'hidden' }}>
      <div style={{ opacity:.2, pointerEvents:'none', userSelect:'none', filter:'blur(2px)' }}>{children}</div>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(7,7,14,0.82)', backdropFilter:'blur(6px)' }}>
        <div style={{ width:54, height:54, borderRadius:'50%', background:`${col[req]}15`, border:`2px solid ${col[req]}35`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
          <i className={`fa-solid ${ic[req]}`} style={{ fontSize:22, color:col[req] }} />
        </div>
        <div style={{ fontWeight:800, fontSize:17, color:'#fff', marginBottom:6 }}>Plan {PLAN_LABEL[req]}</div>
        <div style={{ fontSize:13, color:C.muted, marginBottom:18, textAlign:'center', maxWidth:240, lineHeight:1.6, padding:'0 16px' }}>Upgradez pour accéder à cette fonctionnalité</div>
        <a href="/dashboard/billing" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 22px', borderRadius:11, background:`linear-gradient(135deg,${col[req]},${col[req]}aa)`, color:'#fff', textDecoration:'none', fontSize:13, fontWeight:700 }}>
          <i className="fa-solid fa-arrow-up" /> Upgrader
        </a>
      </div>
    </div>
  );
}

function ImgLoader({ url, onError }) {
  const [s, setS] = useState('loading');
  const t = useRef(null);
  useEffect(()=>{ setS('loading'); const img=new Image(); img.onload=()=>{clearTimeout(t.current);setS('ok');}; img.onerror=()=>{clearTimeout(t.current);setS('err');onError&&onError();}; img.src=url; t.current=setTimeout(()=>{setS('err');onError&&onError();},90000); return()=>clearTimeout(t.current); },[url]);
  if(s==='err') return null;
  if(s==='loading') return(
    <div style={{width:260,height:260,borderRadius:14,background:C.accentLo,border:`1px solid ${C.borderHi}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,marginTop:16}}>
      <i className="fa-solid fa-image" style={{fontSize:32,color:C.accent,animation:'pulse 2s infinite'}} />
      <div style={{textAlign:'center',lineHeight:1.6}}>
        <div style={{fontSize:13,color:'#a89fff',fontWeight:600}}>Génération en cours...</div>
        <div style={{fontSize:11,color:C.muted,marginTop:3}}>30 à 60 sec · Pollinations.ai</div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
  return(
    <div style={{display:'flex',gap:14,alignItems:'flex-start',flexWrap:'wrap',marginTop:16}}>
      <img src={url} alt="IA" style={{borderRadius:14,width:260,height:260,objectFit:'cover',border:`1px solid ${C.border}`}} />
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        <a href={url} target="_blank" rel="noreferrer"><Btn icon="fa-download">Télécharger</Btn></a>
        <CopyBtn text={url} label="Copier l'URL" />
        <div style={{fontSize:11,color:C.muted,marginTop:4}}><i className="fa-solid fa-expand" style={{marginRight:5}}/>1080×1080px</div>
      </div>
    </div>
  );
}

// ─── Toutes les tabs ──────────────────────────────────────────────────────────
const ALL_TABS = [
  // FREE
  { id:'caption',    icon:'fa-pen-nib',          label:'Légende',          plan:'free',    cat:'Gratuit',  desc:'Légende + hashtags SEO' },
  { id:'promo',      icon:'fa-tag',              label:'Offre Promo',      plan:'free',    cat:'Gratuit',  desc:'Créer une promo complète' },
  { id:'review',     icon:'fa-star',             label:'Avis Google',      plan:'free',    cat:'Gratuit',  desc:'Répondre aux avis clients' },
  // STARTER
  { id:'week',       icon:'fa-calendar-week',    label:'Semaine IA',       plan:'starter', cat:'Starter',  desc:'7 posts générés' },
  { id:'bio',        icon:'fa-id-card',          label:'Bio',              plan:'starter', cat:'Starter',  desc:'3 variantes de bio' },
  { id:'image',      icon:'fa-image',            label:'Image IA',         plan:'starter', cat:'Starter',  desc:'Visuel IA gratuit' },
  { id:'script',     icon:'fa-clapperboard',     label:'Script Vidéo',     plan:'starter', cat:'Starter',  desc:'Script TikTok complet' },
  { id:'story',      icon:'fa-mobile-screen',    label:'Stories',          plan:'starter', cat:'Starter',  desc:'Séquence 5 stories' },
  { id:'persona',    icon:'fa-people-group',     label:'Persona Client',   plan:'starter', cat:'Starter',  desc:'Profil client idéal' },
  // PRO
  { id:'ideas30',    icon:'fa-lightbulb',        label:'30 Idées',         plan:'pro',     cat:'Pro',      desc:'Un mois de contenu' },
  { id:'comments',   icon:'fa-comments',         label:'Commentaires',     plan:'pro',     desc:'Réponses types' },
  { id:'strategy90', icon:'fa-chart-line',       label:'Stratégie 90j',    plan:'pro',     cat:'Pro',      desc:'Plan sur 3 mois' },
  { id:'launch',     icon:'fa-rocket',           label:'Lancement Produit',plan:'pro',     cat:'Pro',      desc:'Plan de lancement complet' },
  { id:'email',      icon:'fa-envelope',         label:'Email Relance',    plan:'pro',     cat:'Pro',      desc:'Réengager clients inactifs' },
  { id:'competitor', icon:'fa-chess',            label:'Anti-Concurrent',  plan:'pro',     cat:'Pro',      desc:'Stratégie différenciation' },
  { id:'simulator',  icon:'fa-robot',            label:'Simul. Client',    plan:'pro',     cat:'Pro',      desc:'Entraîne-toi à vendre' },
  // AGENCY
  { id:'audit',      icon:'fa-magnifying-glass', label:'Audit Bio',        plan:'agency',  cat:'Agency',   desc:'Score + version améliorée' },
  { id:'series',     icon:'fa-layer-group',      label:'Série Posts',      plan:'agency',  cat:'Agency',   desc:'5 formats 1 sujet' },
  { id:'translate',  icon:'fa-language',         label:'Traduction',       plan:'agency',  cat:'Agency',   desc:'Adapté culturellement' },
  { id:'hooks',      icon:'fa-bolt',             label:'Hooks Viraux',     plan:'agency',  cat:'Agency',   desc:'Accroches qui stoppent' },
];

const CATS = [
  { key:'Gratuit',  color:C.muted,  icon:'fa-unlock' },
  { key:'Starter',  color:'#a78bfa', icon:'fa-bolt' },
  { key:'Pro',      color:'#8b5cf6', icon:'fa-fire' },
  { key:'Agency',   color:'#FFB800', icon:'fa-crown' },
];

const PLATFORMS = [
  { value:'instagram', label:'Instagram', icon:'fa-instagram', brand:true },
  { value:'tiktok',    label:'TikTok',    icon:'fa-tiktok',    brand:true },
];
const TONES = [
  { value:'professional', label:'Pro',     icon:'fa-briefcase' },
  { value:'fun',          label:'Fun',     icon:'fa-face-laugh' },
  { value:'luxury',       label:'Luxe',    icon:'fa-gem' },
  { value:'young',        label:'Jeune',   icon:'fa-fire' },
];
const COMMENT_TYPES = [
  { value:'positive', label:'Compliments',  icon:'fa-face-smile' },
  { value:'negative', label:'Critiques',    icon:'fa-face-angry' },
  { value:'question', label:'Questions',    icon:'fa-circle-question' },
  { value:'price',    label:'Prix',         icon:'fa-tag' },
  { value:'shipping', label:'Livraison',    icon:'fa-truck' },
];
const LANGS = [
  { value:'en', flag:'🇬🇧', label:'Anglais' },
  { value:'es', flag:'🇪🇸', label:'Espagnol' },
  { value:'ar', flag:'🇸🇦', label:'Arabe' },
  { value:'de', flag:'🇩🇪', label:'Allemand' },
  { value:'it', flag:'🇮🇹', label:'Italien' },
];
const IDEA_CATS = ['Tous','Éducatif','Coulisses','Promotion','Engagement','Inspiration/Motivation','Tendance/Actualité'];
const RATINGS = [1,2,3,4,5];
const PROMO_TYPES = ['Soldes','Flash Sale','Lancement','Anniversaire','Fête','Saison','Fidélité'];

// ═════════════════════════════════════════════════════════════════════════════
export default function ContentGenerator() {
  const { user } = useAuth();
  const userPlan   = user?.subscription?.plan || 'free';
  const userStatus = user?.subscription?.status;
  const isActive   = userStatus === 'active' || userStatus === 'trialing';
  const effectivePlan = (userPlan === 'free' || !isActive) ? 'free' : userPlan;

  const [tab, setTab]       = useState('caption');
  const [platform, setPlt]  = useState('instagram');
  const [tone, setTone]     = useState('professional');
  const [usage, setUsage]   = useState(null);
  const [loading, setLoad]  = useState(false);
  const [error, setError]   = useState('');
  const [result, setResult] = useState(null);

  // Field states
  const [biz, setBiz]             = useState('');
  const [topic, setTopic]         = useState('');
  const [scriptDur, setScriptDur] = useState(30);
  const [filterCat, setFilter]    = useState('Tous');
  const [comType, setComType]     = useState('positive');
  const [targetLang, setLang]     = useState('en');
  const [existingBio, setExBio]   = useState('');
  const [hooksN, setHooksN]       = useState(10);
  const [promoType, setPromoType] = useState('Soldes');
  const [discount, setDiscount]   = useState('-20%');
  const [deadline, setDeadline]   = useState('ce week-end');
  const [reviewText, setReview]   = useState('');
  const [rating, setRating]       = useState(5);
  const [storyGoal, setStoryGoal] = useState('');
  const [inactiveSince, setInact] = useState('3 mois');
  const [offer, setOffer]         = useState('');
  const [productName, setProd]    = useState('');
  const [launchDate, setLaunch]   = useState('dans 2 semaines');
  const [competitorType, setComp] = useState('');
  const [stratGoal, setStratGoal] = useState('Gagner des followers et des clients');

  // Simulator
  const [simPersona, setSimPersona]   = useState(null);
  const [simHistory, setSimHistory]   = useState([]);
  const [simMessage, setSimMessage]   = useState('');
  const [simLoading, setSimLoad]      = useState(false);
  const [simStarted, setSimStarted]   = useState(false);
  const chatRef = useRef(null);

  useEffect(()=>{ api.get('/ai/my-plan').then(r=>setUsage(r.data)).catch(()=>{}); },[result]);
  useEffect(()=>{ if(chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; },[simHistory]);

  const go = async (fn) => {
    setLoad(true); setError(''); setResult(null);
    try { setResult(await fn()); }
    catch(e) {
      const err = e.response?.data;
      if (err?.code==='PLAN_REQUIRED') setError(`Plan ${PLAN_LABEL[err.requiredPlan]} requis`);
      else if (err?.code==='LIMIT_REACHED') setError(`Limite mensuelle atteinte (${err.limit}/mois)`);
      else setError(err?.error||'Erreur, réessayez');
    }
    setLoad(false);
  };

  const sendSimMsg = async () => {
    if (!simMessage.trim() || simLoading) return;
    const msg = simMessage; setSimMessage('');
    const newHistory = [...simHistory, { role:'user', content:msg }];
    setSimHistory(newHistory); setSimLoad(true);
    try {
      const r = await api.post('/ai/simulate-client', { businessType:biz, persona:simPersona, history:newHistory, userMessage:msg });
      setSimHistory(h=>[...h, { role:'assistant', content:r.data.reply }]);
    } catch { setSimHistory(h=>[...h, { role:'assistant', content:'(Erreur de connexion, réessayez)' }]); }
    setSimLoad(false);
  };

  const tabInfo = ALL_TABS.find(t=>t.id===tab);

  // ── Render content tabs ────────────────────────────────────────────────────
  const renderContent = () => {
    switch(tab) {

    // ── LÉGENDE
    case 'caption': return (
      <Card glow>
        <Inp label="Sujet du post" multiline placeholder="ex: Nouvelle collection, Promotion -30%, Lancement produit..." value={topic} onChange={e=>setTopic(e.target.value)} />
        <Inp label="Ton business (optionnel)" placeholder="ex: Boutique mode, Restaurant..." value={biz} onChange={e=>setBiz(e.target.value)} />
        <Btn loading={loading} icon="fa-pen-nib" disabled={!topic.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/caption-full',{topic,platform,tone,businessType:biz}); return r.data; })}>
          Générer légende + hashtags
        </Btn>
        {error && <Alert type="error">{error}</Alert>}
        {result?.caption && (
          <div style={{marginTop:20,animation:'fadeIn .25s ease'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <span style={{fontWeight:700,color:'#c4b5fd',fontSize:14,display:'flex',alignItems:'center',gap:7}}><i className="fa-solid fa-pen-nib"/>Légende</span>
              <CopyBtn text={`${result.caption}\n\n${result.hashtags?.map(h=>`#${h}`).join(' ')}`} label="Tout copier" />
            </div>
            <div style={{background:C.accentLo,border:`1px solid ${C.borderHi}`,borderRadius:12,padding:18,fontSize:14,lineHeight:1.85,whiteSpace:'pre-wrap',marginBottom:14}}>{result.caption}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:8}}><i className="fa-solid fa-hashtag" style={{marginRight:5}}/>{result.hashtags?.length} hashtags</div>
            <div>{result.hashtags?.map((h,i)=><Tag key={i}>{h}</Tag>)}</div>
          </div>
        )}
      </Card>
    );

    // ── PROMO
    case 'promo': return (
      <Card glow>
        <Inp label="Ton business" placeholder="ex: Boutique mode, Salon coiffure, Restaurant..." value={biz} onChange={e=>setBiz(e.target.value)} />
        <div style={{marginBottom:14}}>
          <Lbl>Type de promo</Lbl>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{PROMO_TYPES.map(p=><Chip key={p} active={promoType===p} onClick={()=>setPromoType(p)}>{p}</Chip>)}</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <Inp label="Réduction" placeholder="-20%" value={discount} onChange={e=>setDiscount(e.target.value)} />
          <Inp label="Deadline" placeholder="ce week-end, jusqu'au 31..." value={deadline} onChange={e=>setDeadline(e.target.value)} />
        </div>
        <Btn loading={loading} icon="fa-tag" disabled={!biz.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/promo',{businessType:biz,promoType,discount,deadline,platform}); return r.data; })}>
          Générer la promo complète
        </Btn>
        {error && <Alert type="error">{error}</Alert>}
        {result?.promo && (
          <div style={{marginTop:20}}>
            <div style={{padding:20,background:`linear-gradient(135deg,${C.accentLo},rgba(255,107,53,0.08))`,border:`1px solid ${C.borderHi}`,borderRadius:14,marginBottom:14}}>
              <div style={{fontSize:22,fontWeight:900,marginBottom:4}}>{result.promo.headline}</div>
              <div style={{fontSize:15,color:'#c4b5fd',marginBottom:12}}>{result.promo.subheadline}</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <CopyBtn text={`${result.promo.caption}\n\n${result.promo.hashtags?.map(h=>`#${h}`).join(' ')}`} label="Copier le post" />
                <CopyBtn text={result.promo.storyText} label="Copier la story" />
              </div>
            </div>
            {[
              {l:'📝 Caption',v:result.promo.caption},
              {l:'📱 Story',v:result.promo.storyText},
              {l:'⚡ Urgence',v:result.promo.urgencyPhrase},
              {l:'🎯 CTA',v:result.promo.cta},
              {l:'📋 Conditions',v:result.promo.conditions},
              {l:'⏰ Meilleur moment',v:result.promo.bestPostTime},
            ].map((s,i)=>(
              <div key={i} style={{marginBottom:10,padding:14,background:'rgba(255,255,255,0.02)',border:`1px solid ${C.border}`,borderRadius:11}}>
                <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:6}}>{s.l}</div>
                <div style={{fontSize:13,lineHeight:1.7,color:'#d0d0ee'}}>{s.v}</div>
              </div>
            ))}
            <div>{result.promo.hashtags?.map((h,i)=><Tag key={i}>{h}</Tag>)}</div>
          </div>
        )}
      </Card>
    );

    // ── AVIS GOOGLE
    case 'review': return (
      <Card glow>
        <Inp label="Ton business" placeholder="ex: Restaurant Le Jardin, Salon Beauté..." value={biz} onChange={e=>setBiz(e.target.value)} />
        <Inp label="L'avis reçu" multiline placeholder="Collez l'avis du client ici..." value={reviewText} onChange={e=>setReview(e.target.value)} />
        <div style={{marginBottom:14}}>
          <Lbl>Note de l'avis</Lbl>
          <div style={{display:'flex',gap:6}}>
            {RATINGS.map(r=>(
              <button key={r} onClick={()=>setRating(r)} style={{padding:'7px 13px',borderRadius:9,border:`1px solid ${rating===r?'rgba(255,184,0,0.4)':C.border}`,background:rating===r?'rgba(255,184,0,0.12)':'transparent',color:rating===r?C.yellow:C.muted,cursor:'pointer',fontSize:13,fontFamily:'inherit',fontWeight:700}}>
                {'⭐'.repeat(r)}
              </button>
            ))}
          </div>
        </div>
        <Btn loading={loading} icon="fa-star" disabled={!biz.trim()||!reviewText.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/review-reply',{businessType:biz,reviewText,rating,tone}); return r.data; })}>
          Générer 3 réponses
        </Btn>
        {error && <Alert type="error">{error}</Alert>}
        {result?.replies?.map((r,i)=>(
          <div key={i} style={{marginTop:10,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <span style={{fontSize:11,fontWeight:800,color:C.accent,textTransform:'uppercase',letterSpacing:'1px'}}>{r.style}</span>
              <CopyBtn text={r.reply} />
            </div>
            <div style={{fontSize:13,lineHeight:1.75,color:'#d0d0ee'}}>{r.reply}</div>
          </div>
        ))}
      </Card>
    );

    // ── SEMAINE
    case 'week': return (
      <PlanLock req="starter" cur={effectivePlan}>
        <div>
          <Card style={{marginBottom:12}}>
            <Inp label="Ton business / niche" placeholder="ex: Boutique mode, Coach fitness, Restaurant..." value={biz} onChange={e=>setBiz(e.target.value)} />
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <Btn loading={loading} icon="fa-calendar-week" disabled={!biz.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/week',{businessType:biz,platform,tone}); return r.data; })}>
                Générer la semaine
              </Btn>
              {result?.week && <CopyBtn text={result.week.map(d=>`${d.dayName}: ${d.caption}\n#${d.hashtags?.join(' #')}`).join('\n\n')} label="Tout copier" />}
            </div>
            {error && <Alert type="error">{error}</Alert>}
          </Card>
          {result?.week?.map((day,i)=>(
            <Card key={i} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
                <div style={{display:'flex',alignItems:'center',gap:11}}>
                  <div style={{width:42,height:42,borderRadius:11,background:C.accentLo,border:`1px solid ${C.borderHi}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontWeight:900,fontSize:17,color:C.accent}}>J{day.day}</span>
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14}}>{day.dayName}</div>
                    <div style={{fontSize:11,color:C.muted}}>{day.theme} · <i className="fa-solid fa-clock" style={{fontSize:9}}/> {day.bestTime}</div>
                  </div>
                </div>
                <CopyBtn text={`${day.caption}\n\n${day.hashtags?.map(h=>`#${h}`).join(' ')}`} label="Copier" />
              </div>
              <div style={{fontSize:13,lineHeight:1.8,whiteSpace:'pre-wrap',marginBottom:12,color:'#d0d0ee'}}>{day.caption}</div>
              <div>{day.hashtags?.map((h,j)=><Tag key={j}>{h}</Tag>)}</div>
            </Card>
          ))}
        </div>
      </PlanLock>
    );

    // ── BIO
    case 'bio': return (
      <PlanLock req="starter" cur={effectivePlan}>
        <Card>
          <Inp label="Ton business / niche" placeholder="ex: Coach fitness, Boutique bijoux..." value={biz} onChange={e=>setBiz(e.target.value)} />
          <Btn loading={loading} icon="fa-id-card" disabled={!biz.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/bio',{businessType:biz,platform,tone}); return r.data; })}>Générer 3 bios</Btn>
          {error && <Alert type="error">{error}</Alert>}
          {result?.bios?.map((b,i)=>(
            <div key={i} style={{marginTop:12,background:C.accentLo,border:`1px solid ${C.borderHi}`,borderRadius:12,padding:16}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontSize:10,fontWeight:800,color:C.accent,textTransform:'uppercase',letterSpacing:'1px'}}>{b.style}</span>
                <CopyBtn text={b.bio} />
              </div>
              <div style={{fontSize:14,lineHeight:1.7}}>{b.bio}</div>
              <div style={{fontSize:10,color:C.muted,marginTop:6}}>{b.bio?.length||0}/150 car. {(b.bio?.length||0)>150&&<span style={{color:C.red}}>· Trop long</span>}</div>
            </div>
          ))}
        </Card>
      </PlanLock>
    );

    // ── IMAGE
    case 'image': return (
      <PlanLock req="starter" cur={effectivePlan}>
        <Card>
          <Inp label="Décris ton image" multiline placeholder="ex: Café latte art dans un café parisien, lumière dorée, style editorial..." value={topic} onChange={e=>setTopic(e.target.value)} />
          <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            <Btn loading={loading} icon="fa-image" disabled={!topic.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/image',{prompt:topic}); return r.data; })}>Générer</Btn>
            <span style={{fontSize:11,color:C.muted}}><i className="fa-solid fa-circle-check" style={{color:C.green,marginRight:4}}/>Gratuit · 30-60 sec</span>
          </div>
          {error && <Alert type="error">{error}</Alert>}
          {result?.imageUrl && <ImgLoader url={result.imageUrl} onError={()=>setError('Pollinations surchargé, réessayez')} />}
        </Card>
      </PlanLock>
    );

    // ── SCRIPT
    case 'script': return (
      <PlanLock req="starter" cur={effectivePlan}>
        <Card>
          <Inp label="Sujet" placeholder="ex: Les 3 erreurs à éviter, Mon produit phare..." value={topic} onChange={e=>setTopic(e.target.value)} />
          <Inp label="Ton business" placeholder="ex: Boutique mode..." value={biz} onChange={e=>setBiz(e.target.value)} />
          <div style={{marginBottom:14}}><Lbl>Durée</Lbl><div style={{display:'flex',gap:6}}>{[15,30,60].map(d=><Chip key={d} active={scriptDur===d} onClick={()=>setScriptDur(d)}><i className="fa-solid fa-stopwatch" style={{marginRight:4,fontSize:10}}/>{d}s</Chip>)}</div></div>
          <Btn loading={loading} icon="fa-clapperboard" disabled={!topic.trim()||!biz.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/video-script',{topic,businessType:biz,duration:scriptDur}); return r.data; })}>Générer le script</Btn>
          {error && <Alert type="error">{error}</Alert>}
          {result?.script && (
            <div style={{marginTop:18}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                <span style={{fontWeight:700,color:'#c4b5fd',fontSize:14}}><i className="fa-solid fa-clapperboard" style={{marginRight:7}}/>Script {scriptDur}s</span>
                <CopyBtn text={`HOOK: ${result.script.hook}\n\n${result.script.content}\n\nCTA: ${result.script.cta}`} label="Tout copier" />
              </div>
              {[{l:'🪝 Hook (0-3s)',v:result.script.hook,c:C.red},{l:'📝 Contenu',v:result.script.content,c:C.accent},{l:'🎯 CTA',v:result.script.cta,c:C.green}].map((s,i)=>(
                <div key={i} style={{marginBottom:10,padding:14,background:'rgba(255,255,255,0.02)',border:`1px solid ${C.border}`,borderLeft:`3px solid ${s.c}`,borderRadius:'0 11px 11px 0'}}>
                  <div style={{fontSize:10,fontWeight:700,color:s.c,marginBottom:6,textTransform:'uppercase',letterSpacing:'1px'}}>{s.l}</div>
                  <div style={{fontSize:13,lineHeight:1.7,color:'#d0d0ee'}}>{s.v}</div>
                </div>
              ))}
              {result.script.visualTips?.length>0 && (
                <div style={{padding:14,background:'rgba(255,184,0,0.06)',border:'1px solid rgba(255,184,0,0.2)',borderRadius:11,marginBottom:10}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.yellow,marginBottom:8,textTransform:'uppercase'}}><i className="fa-solid fa-video" style={{marginRight:5}}/>Conseils tournage</div>
                  {result.script.visualTips.map((t,i)=><div key={i} style={{fontSize:12,color:'#a0a0c0',marginBottom:4}}>• {t}</div>)}
                </div>
              )}
              <div>{result.script.hashtags?.map((h,i)=><Tag key={i}>{h}</Tag>)}</div>
            </div>
          )}
        </Card>
      </PlanLock>
    );

    // ── STORIES
    case 'story': return (
      <PlanLock req="starter" cur={effectivePlan}>
        <Card>
          <Inp label="Ton business" placeholder="ex: Boutique mode, Restaurant..." value={biz} onChange={e=>setBiz(e.target.value)} />
          <Inp label="Objectif de la séquence" placeholder="ex: Vendre mon produit, Annoncer une promo, Gagner des abonnés..." value={storyGoal} onChange={e=>setStoryGoal(e.target.value)} />
          <Btn loading={loading} icon="fa-mobile-screen" disabled={!biz.trim()||!storyGoal.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/story-sequence',{businessType:biz,goal:storyGoal,platform}); return r.data; })}>
            Générer la séquence
          </Btn>
          {error && <Alert type="error">{error}</Alert>}
          {result?.stories && (
            <div style={{marginTop:18}}>
              <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:10}}>
                {result.stories.map((s,i)=>(
                  <div key={i} style={{minWidth:200,background:'linear-gradient(135deg,#1a1a35,#0d0d20)',border:`1px solid ${C.borderHi}`,borderRadius:16,padding:16,flexShrink:0}}>
                    <div style={{fontSize:10,fontWeight:800,color:C.accent,marginBottom:10,textTransform:'uppercase',letterSpacing:'1px'}}>Slide {s.slide} · {s.type}</div>
                    <div style={{fontSize:15,fontWeight:700,lineHeight:1.5,marginBottom:8}}>{s.text}</div>
                    {s.subtext && <div style={{fontSize:12,color:C.muted,marginBottom:10}}>{s.subtext}</div>}
                    {s.sticker && <div style={{fontSize:11,color:C.yellow,marginBottom:6}}><i className="fa-solid fa-star" style={{marginRight:5}}/>Sticker: {s.sticker}</div>}
                    {s.tip && <div style={{fontSize:10,color:C.muted,borderTop:`1px solid ${C.border}`,paddingTop:8,marginTop:6}}>💡 {s.tip}</div>}
                    <CopyBtn text={`${s.text}${s.subtext?'\n'+s.subtext:''}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </PlanLock>
    );

    // ── PERSONA
    case 'persona': return (
      <PlanLock req="starter" cur={effectivePlan}>
        <Card>
          <Inp label="Ton business / niche" placeholder="ex: Boutique mode femme, Coach fitness, Restaurant japonais..." value={biz} onChange={e=>setBiz(e.target.value)} />
          <Btn loading={loading} icon="fa-people-group" disabled={!biz.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/persona',{businessType:biz,platform}); return r.data; })}>
            Créer le persona client
          </Btn>
          {error && <Alert type="error">{error}</Alert>}
          {result?.persona && (
            <div style={{marginTop:20}}>
              {/* Header persona */}
              <div style={{display:'flex',alignItems:'center',gap:16,padding:18,background:'linear-gradient(135deg,rgba(124,92,252,0.12),rgba(90,64,212,0.06))',border:`1px solid ${C.borderHi}`,borderRadius:14,marginBottom:16}}>
                <div style={{width:56,height:56,borderRadius:'50%',background:'linear-gradient(135deg,#7C5CFC,#5a40d4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>
                  👤
                </div>
                <div>
                  <div style={{fontWeight:900,fontSize:20}}>{result.persona.name}</div>
                  <div style={{fontSize:13,color:C.muted}}>{result.persona.age} · {result.persona.job} · {result.persona.location}</div>
                  <div style={{fontSize:12,color:'#a78bfa',marginTop:2}}>{result.persona.income}</div>
                </div>
              </div>
              <div style={{fontSize:13,lineHeight:1.75,color:'#d0d0ee',marginBottom:16,padding:14,background:'rgba(255,255,255,0.02)',borderRadius:11}}>{result.persona.bio}</div>
              {[
                {icon:'fa-bullseye',label:'Objectifs',items:result.persona.goals,color:C.green},
                {icon:'fa-heart-crack',label:'Frustrations',items:result.persona.painPoints,color:C.red},
                {icon:'fa-shield-halved',label:'Objections d\'achat',items:result.persona.objections,color:C.orange},
                {icon:'fa-bolt',label:'Déclencheurs d\'achat',items:result.persona.triggers,color:C.yellow},
                {icon:'fa-comment-dots',label:'Arguments qui marchent',items:result.persona.salesArguments,color:C.accent},
              ].map((s,i)=>(
                <div key={i} style={{marginBottom:10,padding:14,background:'rgba(255,255,255,0.02)',border:`1px solid ${C.border}`,borderLeft:`3px solid ${s.color}`,borderRadius:'0 11px 11px 0'}}>
                  <div style={{fontSize:11,fontWeight:700,color:s.color,marginBottom:8,textTransform:'uppercase',letterSpacing:'1px',display:'flex',alignItems:'center',gap:6}}>
                    <i className={`fa-solid ${s.icon}`}/>{s.label}
                  </div>
                  {s.items?.map((it,j)=><div key={j} style={{fontSize:12,color:'#a0a0c0',marginBottom:4}}>• {it}</div>)}
                </div>
              ))}
              <div style={{padding:14,background:'rgba(0,214,143,0.06)',border:'1px solid rgba(0,214,143,0.2)',borderRadius:11,marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:700,color:C.green,marginBottom:8,textTransform:'uppercase',letterSpacing:'1px'}}><i className="fa-solid fa-check" style={{marginRight:5}}/>Mots qui résonnent</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {result.persona.useWords?.map((w,i)=><span key={i} style={{padding:'3px 10px',background:'rgba(0,214,143,0.1)',border:'1px solid rgba(0,214,143,0.25)',borderRadius:999,color:C.green,fontSize:12,fontWeight:600}}>{w}</span>)}
                </div>
              </div>
              <div style={{padding:14,background:'rgba(255,92,92,0.06)',border:'1px solid rgba(255,92,92,0.2)',borderRadius:11}}>
                <div style={{fontSize:11,fontWeight:700,color:C.red,marginBottom:8,textTransform:'uppercase',letterSpacing:'1px'}}><i className="fa-solid fa-xmark" style={{marginRight:5}}/>Mots à éviter</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {result.persona.avoidWords?.map((w,i)=><span key={i} style={{padding:'3px 10px',background:'rgba(255,92,92,0.1)',border:'1px solid rgba(255,92,92,0.25)',borderRadius:999,color:C.red,fontSize:12,fontWeight:600}}>{w}</span>)}
                </div>
              </div>
            </div>
          )}
        </Card>
      </PlanLock>
    );

    // ── 30 IDÉES
    case 'ideas30': return (
      <PlanLock req="pro" cur={effectivePlan}>
        <div>
          <Card style={{marginBottom:14}}>
            <Inp label="Ton business" placeholder="ex: Boutique mode, Salon coiffure..." value={biz} onChange={e=>setBiz(e.target.value)} />
            <Btn loading={loading} icon="fa-lightbulb" disabled={!biz.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/ideas30',{businessType:biz,platform}); return r.data; })}>Générer 30 idées</Btn>
            {error && <Alert type="error">{error}</Alert>}
          </Card>
          {result?.ideas && (
            <>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
                {IDEA_CATS.map(c=><Chip key={c} active={filterCat===c} onClick={()=>setFilter(c)}>{c}</Chip>)}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:10}}>
                {result.ideas.filter(i=>filterCat==='Tous'||i.category===filterCat).map((idea,i)=>(
                  <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,padding:16,transition:'all .2s',cursor:'default'}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderHi;e.currentTarget.style.background=C.cardHover;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card;}}>
                    <div style={{fontSize:10,fontWeight:800,color:C.accent,textTransform:'uppercase',letterSpacing:'1px',marginBottom:6}}>{idea.category}</div>
                    <div style={{fontWeight:700,fontSize:13,marginBottom:7,lineHeight:1.4}}>{idea.title}</div>
                    <div style={{fontSize:12,color:C.muted,lineHeight:1.55,marginBottom:12,fontStyle:'italic'}}>"{idea.hook}"</div>
                    <CopyBtn text={`${idea.title}\n\n${idea.hook}`} label="Copier" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </PlanLock>
    );

    // ── COMMENTAIRES
    case 'comments': return (
      <PlanLock req="pro" cur={effectivePlan}>
        <Card>
          <Inp label="Ton business" placeholder="ex: Boutique vêtements, Restaurant..." value={biz} onChange={e=>setBiz(e.target.value)} />
          <div style={{marginBottom:14}}>
            <Lbl>Type de commentaire</Lbl>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {COMMENT_TYPES.map(t=>(
                <button key={t.value} onClick={()=>setComType(t.value)} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 13px',borderRadius:10,border:`1px solid ${comType===t.value?C.borderHi:C.border}`,background:comType===t.value?C.accentLo:'transparent',color:comType===t.value?'#c4b5fd':C.muted,cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'inherit',transition:'all .15s'}}>
                  <i className={`fa-solid ${t.icon}`} style={{fontSize:11}}/>{t.label}
                </button>
              ))}
            </div>
          </div>
          <Btn loading={loading} icon="fa-comments" disabled={!biz.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/comment-replies',{businessType:biz,commentType:comType}); return r.data; })}>
            Générer les réponses
          </Btn>
          {error && <Alert type="error">{error}</Alert>}
          {result?.replies?.map((r,i)=>(
            <div key={i} style={{marginTop:10,background:C.accentLo,border:`1px solid ${C.borderHi}`,borderRadius:12,padding:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,lineHeight:1.75,marginBottom:6}}>{r.reply}</div>
                  {r.note && <div style={{fontSize:11,color:C.muted}}><i className="fa-solid fa-circle-info" style={{marginRight:4,fontSize:9}}/>{r.note}</div>}
                </div>
                <CopyBtn text={r.reply} />
              </div>
            </div>
          ))}
        </Card>
      </PlanLock>
    );

    // ── STRATÉGIE 90J
    case 'strategy90': return (
      <PlanLock req="pro" cur={effectivePlan}>
        <Card>
          <Inp label="Ton business" placeholder="ex: Boutique mode, Coach fitness..." value={biz} onChange={e=>setBiz(e.target.value)} />
          <Inp label="Ton objectif principal" placeholder="ex: Doubler mes ventes, Atteindre 10k abonnés..." value={stratGoal} onChange={e=>setStratGoal(e.target.value)} />
          <Btn loading={loading} icon="fa-chart-line" disabled={!biz.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/strategy90',{businessType:biz,goal:stratGoal,platform}); return r.data; })}>
            Générer mon plan 90 jours
          </Btn>
          {error && <Alert type="error">{error}</Alert>}
          {result?.strategy && (
            <div style={{marginTop:20}}>
              <div style={{padding:16,background:C.accentLo,border:`1px solid ${C.borderHi}`,borderRadius:12,marginBottom:16,fontSize:14,lineHeight:1.75}}>{result.strategy.overview}</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
                {result.strategy.kpis?.map((k,i)=>(
                  <div key={i} style={{padding:'6px 13px',background:'rgba(0,214,143,0.08)',border:'1px solid rgba(0,214,143,0.2)',borderRadius:999,fontSize:12,color:C.green,fontWeight:600}}>
                    <i className="fa-solid fa-chart-simple" style={{marginRight:5,fontSize:10}}/>{k}
                  </div>
                ))}
              </div>
              {result.strategy.months?.map((m,i)=>(
                <div key={i} style={{marginBottom:14,border:`1px solid ${C.border}`,borderRadius:14,overflow:'hidden'}}>
                  <div style={{padding:'14px 18px',background:'linear-gradient(135deg,rgba(124,92,252,0.15),rgba(90,64,212,0.08))',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:16}}>Mois {m.month} — {m.theme}</div>
                      <div style={{fontSize:12,color:C.muted,marginTop:2}}>{m.objective}</div>
                    </div>
                    <div style={{width:36,height:36,borderRadius:'50%',background:C.accentLo,border:`1px solid ${C.borderHi}`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:18,color:C.accent}}>{m.month}</div>
                  </div>
                  <div style={{padding:'12px 18px'}}>
                    {m.weeks?.map((w,j)=>(
                      <div key={j} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:j<m.weeks.length-1?`1px solid ${C.border}`:'none',alignItems:'flex-start'}}>
                        <div style={{minWidth:60,fontSize:11,fontWeight:700,color:C.muted}}>Sem {w.week}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>{w.focus}</div>
                          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                            {w.contentTypes?.map((ct,k)=><span key={k} style={{fontSize:10,padding:'2px 7px',borderRadius:999,background:C.accentLo,color:'#a89fff',border:`1px solid ${C.borderHi}`}}>{ct}</span>)}
                            <span style={{fontSize:10,color:C.muted}}>{w.postFrequency}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </PlanLock>
    );

    // ── LANCEMENT PRODUIT
    case 'launch': return (
      <PlanLock req="pro" cur={effectivePlan}>
        <Card>
          <Inp label="Ton business" placeholder="ex: Boutique mode, Coach fitness..." value={biz} onChange={e=>setBiz(e.target.value)} />
          <Inp label="Nom du produit / service" placeholder="ex: Collection Été 2025, Programme Coaching 8 semaines..." value={productName} onChange={e=>setProd(e.target.value)} />
          <Inp label="Date de lancement" placeholder="ex: dans 2 semaines, le 15 mars..." value={launchDate} onChange={e=>setLaunch(e.target.value)} />
          <Btn loading={loading} icon="fa-rocket" disabled={!biz.trim()||!productName.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/launch-plan',{businessType:biz,productName,launchDate,platform}); return r.data; })}>
            Générer le plan de lancement
          </Btn>
          {error && <Alert type="error">{error}</Alert>}
          {result?.plan && (
            <div style={{marginTop:20}}>
              <div style={{padding:14,background:C.accentLo,border:`1px solid ${C.borderHi}`,borderRadius:12,marginBottom:16,fontSize:13,lineHeight:1.75}}>{result.plan.strategy}</div>
              {result.plan.phases?.map((phase,i)=>(
                <div key={i} style={{marginBottom:14}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                    <div style={{padding:'5px 12px',borderRadius:999,background:i===0?'rgba(255,184,0,0.12)':i===1?C.accentLo:'rgba(0,214,143,0.12)',border:`1px solid ${i===0?'rgba(255,184,0,0.3)':i===1?C.borderHi:'rgba(0,214,143,0.3)'}`,color:i===0?C.yellow:i===1?'#c4b5fd':C.green,fontSize:12,fontWeight:700}}>
                      <i className={`fa-solid ${i===0?'fa-hourglass-start':i===1?'fa-rocket':'fa-flag-checkered'}`} style={{marginRight:5}}/>{phase.phase}
                    </div>
                    <div style={{fontSize:12,color:C.muted}}>{phase.objective}</div>
                  </div>
                  {phase.posts?.map((p,j)=>(
                    <div key={j} style={{padding:13,background:'rgba(255,255,255,0.02)',border:`1px solid ${C.border}`,borderRadius:11,marginBottom:7,display:'flex',gap:12,alignItems:'flex-start'}}>
                      <div style={{minWidth:44,fontWeight:800,fontSize:12,color:C.accent,paddingTop:2}}>{p.day}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{p.type}</div>
                        <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>{p.content}</div>
                        <div style={{fontSize:12,color:'#a89fff',fontStyle:'italic'}}>"{p.hook}"</div>
                      </div>
                      <CopyBtn text={`${p.content}\n\n"${p.hook}"`} />
                    </div>
                  ))}
                </div>
              ))}
              <div style={{marginTop:10}}>{result.plan.hashtags?.map((h,i)=><Tag key={i}>{h}</Tag>)}</div>
            </div>
          )}
        </Card>
      </PlanLock>
    );

    // ── EMAIL RELANCE
    case 'email': return (
      <PlanLock req="pro" cur={effectivePlan}>
        <Card>
          <Inp label="Ton business" placeholder="ex: Boutique mode, Restaurant, Salon..." value={biz} onChange={e=>setBiz(e.target.value)} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Inp label="Inactif depuis" placeholder="ex: 3 mois, 6 mois..." value={inactiveSince} onChange={e=>setInact(e.target.value)} />
            <Inp label="Offre / accroche" placeholder="ex: -15% exclusif, retour surprise..." value={offer} onChange={e=>setOffer(e.target.value)} />
          </div>
          <Btn loading={loading} icon="fa-envelope" disabled={!biz.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/reengagement-email',{businessType:biz,inactiveSince,offer}); return r.data; })}>
            Générer l'email de relance
          </Btn>
          {error && <Alert type="error">{error}</Alert>}
          {result?.email && (
            <div style={{marginTop:20}}>
              <div style={{padding:18,background:C.card,border:`1px solid ${C.border}`,borderRadius:14}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                  <div>
                    <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',marginBottom:4}}>Objet</div>
                    <div style={{fontWeight:700,fontSize:15}}>{result.email.subject}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:3}}>Preview: {result.email.preheader}</div>
                  </div>
                  <CopyBtn text={`Objet: ${result.email.subject}\n\n${result.email.body}\n\n${result.email.ps?'P.S. '+result.email.ps:''}`} label="Tout copier" />
                </div>
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14,fontSize:13,lineHeight:1.85,whiteSpace:'pre-wrap',color:'#d0d0ee',marginBottom:12}}>{result.email.body}</div>
                {result.email.cta && <div style={{padding:'10px 18px',background:C.accentLo,border:`1px solid ${C.borderHi}`,borderRadius:9,fontWeight:700,fontSize:14,color:'#c4b5fd',textAlign:'center',marginBottom:10}}>{result.email.cta}</div>}
                {result.email.ps && <div style={{fontSize:12,color:C.muted,fontStyle:'italic'}}>P.S. {result.email.ps}</div>}
              </div>
            </div>
          )}
        </Card>
      </PlanLock>
    );

    // ── ANTI-CONCURRENT
    case 'competitor': return (
      <PlanLock req="pro" cur={effectivePlan}>
        <Card>
          <Inp label="Ton business" placeholder="ex: Boutique mode, Coach fitness..." value={biz} onChange={e=>setBiz(e.target.value)} />
          <Inp label="Type de concurrent à analyser" placeholder="ex: Grandes enseignes mode, Autres coachs fitness en ligne..." value={competitorType} onChange={e=>setComp(e.target.value)} />
          <Btn loading={loading} icon="fa-chess" disabled={!biz.trim()||!competitorType.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/competitor-strategy',{businessType:biz,competitorType,platform}); return r.data; })}>
            Analyser et me différencier
          </Btn>
          {error && <Alert type="error">{error}</Alert>}
          {result?.strategy && (
            <div style={{marginTop:20}}>
              {[
                {icon:'fa-shield-halved',label:'Leurs faiblesses',items:result.strategy.competitorWeaknesses,color:C.red},
                {icon:'fa-star',label:'Tes angles de différenciation',items:result.strategy.differentiators,color:C.green},
                {icon:'fa-magnifying-glass',label:'Sujets qu\'ils ne couvrent pas',items:result.strategy.contentGaps,color:C.yellow},
                {icon:'fa-list-check',label:'Actions immédiates',items:result.strategy.actionPlan,color:C.accent},
              ].map((s,i)=>(
                <div key={i} style={{marginBottom:12,padding:14,background:'rgba(255,255,255,0.02)',border:`1px solid ${C.border}`,borderLeft:`3px solid ${s.color}`,borderRadius:'0 11px 11px 0'}}>
                  <div style={{fontSize:11,fontWeight:700,color:s.color,marginBottom:8,textTransform:'uppercase',letterSpacing:'1px',display:'flex',alignItems:'center',gap:6}}>
                    <i className={`fa-solid ${s.icon}`}/>{s.label}
                  </div>
                  {s.items?.map((it,j)=><div key={j} style={{fontSize:12,color:'#a0a0c0',marginBottom:4}}>• {it}</div>)}
                </div>
              ))}
              {result.strategy.contentIdeas?.length>0 && (
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#c4b5fd',marginBottom:10,textTransform:'uppercase',letterSpacing:'1px'}}>💡 Idées de posts différenciants</div>
                  {result.strategy.contentIdeas.map((idea,i)=>(
                    <div key={i} style={{padding:13,background:'rgba(124,92,252,0.06)',border:`1px solid ${C.borderHi}`,borderRadius:11,marginBottom:7}}>
                      <div style={{fontWeight:600,fontSize:13,marginBottom:4}}>{idea.title}</div>
                      <div style={{fontSize:11,color:C.muted}}>{idea.why}</div>
                    </div>
                  ))}
                </div>
              )}
              {result.strategy.toneAdvice && <Alert type="info" icon="fa-comment">{result.strategy.toneAdvice}</Alert>}
            </div>
          )}
        </Card>
      </PlanLock>
    );

    // ── SIMULATEUR CLIENT
    case 'simulator': return (
      <PlanLock req="pro" cur={effectivePlan}>
        <div>
          {!simStarted ? (
            <Card>
              <Alert type="info" icon="fa-robot">
                Le simulateur crée un client IA avec des objections réelles. Entraîne-toi à vendre, convaincre, répondre aux doutes — avant de parler à de vrais clients.
              </Alert>
              <div style={{marginTop:16}}>
                <Inp label="Ton business" placeholder="ex: Boutique mode femme, Coach fitness, Restaurant..." value={biz} onChange={e=>setBiz(e.target.value)} />
                <Btn loading={loading} icon="fa-robot" disabled={!biz.trim()} onClick={()=>go(async()=>{
                  const r=await api.post('/ai/persona',{businessType:biz,platform});
                  setSimPersona(r.data.persona);
                  setSimHistory([{role:'assistant',content:`Bonjour ! Je cherche ${biz.toLowerCase()}. Vous pouvez m'en dire plus sur ce que vous proposez ?`}]);
                  setSimStarted(true);
                  return r.data;
                })}>
                  Démarrer la simulation
                </Btn>
              </div>
              {error && <Alert type="error">{error}</Alert>}
            </Card>
          ) : (
            <div>
              {/* Persona info */}
              {simPersona && (
                <Card style={{marginBottom:12,display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,#7C5CFC,#5a40d4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>👤</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14}}>{simPersona.name} · {simPersona.age} · {simPersona.job}</div>
                    <div style={{fontSize:11,color:C.muted}}>Client simulé — a des objections réelles</div>
                  </div>
                  <Btn icon="fa-rotate" variant="ghost" small onClick={()=>{setSimStarted(false);setSimHistory([]);setSimPersona(null);setResult(null);}}>Réinitialiser</Btn>
                </Card>
              )}
              {/* Chat */}
              <Card style={{padding:0,overflow:'hidden'}}>
                <div ref={chatRef} style={{height:380,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12}}>
                  {simHistory.map((m,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
                      <div style={{maxWidth:'78%',padding:'11px 15px',borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',background:m.role==='user'?'linear-gradient(135deg,#7C5CFC,#5a40d4)':'rgba(255,255,255,0.06)',color:'#fff',fontSize:13,lineHeight:1.6}}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {simLoading && (
                    <div style={{display:'flex',justifyContent:'flex-start'}}>
                      <div style={{padding:'11px 15px',borderRadius:'16px 16px 16px 4px',background:'rgba(255,255,255,0.06)',color:C.muted,fontSize:13}}>
                        <i className="fa-solid fa-ellipsis fa-fade"/>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{padding:'12px 16px',borderTop:`1px solid ${C.border}`,display:'flex',gap:10}}>
                  <input value={simMessage} onChange={e=>setSimMessage(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&sendSimMsg()}
                    placeholder="Réponds au client... (Entrée pour envoyer)"
                    style={{flex:1,padding:'11px 14px',background:'rgba(255,255,255,0.05)',border:`1px solid ${C.border}`,borderRadius:11,color:C.text,fontSize:14,fontFamily:'inherit',outline:'none'}}
                    onFocus={e=>e.target.style.borderColor=C.borderHi} onBlur={e=>e.target.style.borderColor=C.border}
                  />
                  <Btn icon="fa-paper-plane" disabled={!simMessage.trim()||simLoading} onClick={sendSimMsg}>Envoyer</Btn>
                </div>
              </Card>
            </div>
          )}
        </div>
      </PlanLock>
    );

    // ── AUDIT BIO
    case 'audit': return (
      <PlanLock req="agency" cur={effectivePlan}>
        <Card>
          <Inp label="Ta bio actuelle" multiline placeholder="Colle ici ta bio Instagram ou TikTok..." value={existingBio} onChange={e=>setExBio(e.target.value)} />
          <Inp label="Ton business" placeholder="ex: Boutique mode, Coach fitness..." value={biz} onChange={e=>setBiz(e.target.value)} />
          <Btn loading={loading} icon="fa-magnifying-glass" disabled={!existingBio.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/audit-bio',{bio:existingBio,platform,businessType:biz}); return r.data; })}>
            Analyser ma bio
          </Btn>
          {error && <Alert type="error">{error}</Alert>}
          {result?.audit && (
            <div style={{marginTop:20}}>
              <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:18,padding:18,background:'rgba(255,255,255,0.02)',borderRadius:14}}>
                <div style={{position:'relative',flexShrink:0}}>
                  <svg width="68" height="68" viewBox="0 0 68 68">
                    <circle cx="34" cy="34" r="29" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
                    <circle cx="34" cy="34" r="29" fill="none" stroke={result.audit.score>=70?C.green:result.audit.score>=40?C.yellow:C.red} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(result.audit.score/100)*182} 182`} transform="rotate(-90 34 34)"/>
                  </svg>
                  <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:17,color:result.audit.score>=70?C.green:result.audit.score>=40?C.yellow:C.red}}>{result.audit.score}</div>
                </div>
                <div>
                  <div style={{fontWeight:800,fontSize:19,marginBottom:3}}>{result.audit.scoreLabel}</div>
                  <div style={{fontSize:12,color:C.muted}}>Score sur 100</div>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
                {[{icon:'fa-thumbs-up',l:'Points forts',items:result.audit.strengths,c:C.green},{icon:'fa-triangle-exclamation',l:'Problèmes',items:result.audit.weaknesses,c:C.red}].map((s,i)=>(
                  <div key={i} style={{padding:13,background:'rgba(255,255,255,0.02)',border:`1px solid ${C.border}`,borderRadius:12}}>
                    <div style={{fontWeight:700,color:s.c,fontSize:11,marginBottom:8,display:'flex',alignItems:'center',gap:5,textTransform:'uppercase',letterSpacing:'1px'}}>
                      <i className={`fa-solid ${s.icon}`}/>{s.l}
                    </div>
                    {s.items?.map((it,j)=><div key={j} style={{fontSize:11,color:'#a0a0c0',marginBottom:4}}>• {it}</div>)}
                  </div>
                ))}
              </div>
              <div style={{padding:16,background:C.accentLo,border:`1px solid ${C.borderHi}`,borderRadius:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                  <span style={{fontWeight:700,color:'#c4b5fd',fontSize:13,display:'flex',alignItems:'center',gap:7}}><i className="fa-solid fa-wand-magic-sparkles"/>Version améliorée</span>
                  <CopyBtn text={result.audit.improved} />
                </div>
                <div style={{fontSize:14,lineHeight:1.75}}>{result.audit.improved}</div>
              </div>
            </div>
          )}
        </Card>
      </PlanLock>
    );

    // ── SÉRIE
    case 'series': return (
      <PlanLock req="agency" cur={effectivePlan}>
        <Card>
          <Inp label="Sujet de la série" placeholder="ex: Comment bien s'habiller, Les bienfaits du sport..." value={topic} onChange={e=>setTopic(e.target.value)} />
          <Inp label="Ton business" placeholder="ex: Boutique mode, Coach fitness..." value={biz} onChange={e=>setBiz(e.target.value)} />
          <Btn loading={loading} icon="fa-layer-group" disabled={!topic.trim()||!biz.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/post-series',{topic,businessType:biz,platform}); return r.data; })}>
            Générer la série (5 posts)
          </Btn>
          {error && <Alert type="error">{error}</Alert>}
          {result?.series?.map((p,i)=>(
            <div key={i} style={{marginTop:10,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                <div>
                  <div style={{fontSize:10,fontWeight:800,color:C.accent,textTransform:'uppercase',letterSpacing:'1px',marginBottom:3}}>{p.format}</div>
                  <div style={{fontWeight:700,fontSize:14}}>{p.title}</div>
                </div>
                <CopyBtn text={`${p.caption}\n\n#${p.hashtags?.join(' #')}`} label="Copier" />
              </div>
              <div style={{fontSize:13,lineHeight:1.8,whiteSpace:'pre-wrap',marginBottom:10,color:'#d0d0ee'}}>{p.caption}</div>
              <div>{p.hashtags?.map((h,j)=><Tag key={j}>{h}</Tag>)}</div>
            </div>
          ))}
        </Card>
      </PlanLock>
    );

    // ── TRADUCTION
    case 'translate': return (
      <PlanLock req="agency" cur={effectivePlan}>
        <Card>
          <Inp label="Légende à traduire" multiline placeholder="Colle ici ta légende française..." value={topic} onChange={e=>setTopic(e.target.value)} />
          <div style={{marginBottom:14}}>
            <Lbl>Langue cible</Lbl>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {LANGS.map(l=><Chip key={l.value} active={targetLang===l.value} onClick={()=>setLang(l.value)}>{l.flag} {l.label}</Chip>)}
            </div>
          </div>
          <Btn loading={loading} icon="fa-language" disabled={!topic.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/translate',{caption:topic,targetLang}); return r.data; })}>
            Traduire et adapter
          </Btn>
          {error && <Alert type="error">{error}</Alert>}
          {result?.translated && (
            <div style={{marginTop:18}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <span style={{fontWeight:700,color:'#c4b5fd',fontSize:14}}><i className="fa-solid fa-language" style={{marginRight:7}}/>Post traduit</span>
                <CopyBtn text={`${result.translated.caption}\n\n${result.translated.hashtags?.map(h=>`#${h}`).join(' ')}`} label="Tout copier" />
              </div>
              <div style={{background:C.accentLo,border:`1px solid ${C.borderHi}`,borderRadius:12,padding:16,fontSize:14,lineHeight:1.85,marginBottom:10}}>{result.translated.caption}</div>
              <div style={{marginBottom:10}}>{result.translated.hashtags?.map((h,i)=><Tag key={i}>{h}</Tag>)}</div>
              {result.translated.culturalNote && <Alert type="info" icon="fa-globe">{result.translated.culturalNote}</Alert>}
            </div>
          )}
        </Card>
      </PlanLock>
    );

    // ── HOOKS VIRAUX
    case 'hooks': return (
      <PlanLock req="agency" cur={effectivePlan}>
        <Card>
          <Inp label="Ta niche / sujet" placeholder="ex: Mode femme, Nutrition, Finance perso..." value={topic} onChange={e=>setTopic(e.target.value)} />
          <div style={{marginBottom:14}}>
            <Lbl>Nombre</Lbl>
            <div style={{display:'flex',gap:6}}>{[5,10,15].map(n=><Chip key={n} active={hooksN===n} onClick={()=>setHooksN(n)}>{n} hooks</Chip>)}</div>
          </div>
          <Btn loading={loading} icon="fa-bolt" disabled={!topic.trim()} onClick={()=>go(async()=>{ const r=await api.post('/ai/viral-hooks',{topic,platform,count:hooksN}); return r.data; })}>
            Générer les hooks viraux
          </Btn>
          {error && <Alert type="error">{error}</Alert>}
          {result?.hooks?.map((h,i)=>(
            <div key={i} style={{marginTop:10,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16,transition:'all .2s'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderHi}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,lineHeight:1.5,marginBottom:8}}>"{h.hook}"</div>
                  <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
                    <span style={{fontSize:10,padding:'2px 9px',borderRadius:999,background:C.accentLo,color:'#a89fff',border:`1px solid ${C.borderHi}`,fontWeight:700}}>{h.technique}</span>
                    <span style={{fontSize:11,color:C.muted}}>{h.why}</span>
                  </div>
                </div>
                <CopyBtn text={h.hook} />
              </div>
            </div>
          ))}
        </Card>
      </PlanLock>
    );

    default: return null;
    }
  };

  return (
    <div style={{minHeight:'100vh',background:C.bg,color:C.text,fontFamily:"'Outfit',sans-serif",padding:'20px 16px',maxWidth:880,margin:'0 auto'}}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:640px){
          .grid-options{flex-direction:column !important;}
          .tab-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;}
        }
      `}</style>

      {/* Header */}
      <div style={{marginBottom:20,display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:10}}>
        <div>
          <h1 style={{fontSize:'clamp(18px,3vw,26px)',fontWeight:900,marginBottom:3,display:'flex',alignItems:'center',gap:9}}>
            <i className="fa-solid fa-wand-magic-sparkles" style={{color:C.accent}}/>Studio Contenu IA
          </h1>
          <p style={{color:C.muted,fontSize:13}}>Contenu prêt à publier — sans connecter vos réseaux</p>
        </div>
        {usage && (
          <div style={{padding:'9px 14px',background:C.card,border:`1px solid ${C.border}`,borderRadius:11,fontSize:13,display:'flex',alignItems:'center',gap:8}}>
            <i className={`fa-solid ${usage.plan==='agency'?'fa-crown':usage.plan==='pro'?'fa-fire':usage.plan==='starter'?'fa-bolt':'fa-user'}`} style={{color:PLAN_COLOR[usage.plan],fontSize:12}}/>
            <span style={{color:PLAN_COLOR[usage.plan],fontWeight:700}}>{PLAN_LABEL[usage.plan]}</span>
            <span style={{color:C.subtle}}>·</span>
            <span style={{color:C.text,fontWeight:600}}>{usage.used}</span>
            <span style={{color:C.muted}}>/{usage.limit===-1?'∞':usage.limit}</span>
          </div>
        )}
      </div>

      {/* Options globales */}
      <Card style={{marginBottom:16,display:'flex',gap:20,flexWrap:'wrap',alignItems:'center'}} className="grid-options">
        <div>
          <Lbl>Plateforme</Lbl>
          <div style={{display:'flex',gap:6}}>
            {PLATFORMS.map(p=>(
              <button key={p.value} onClick={()=>setPlt(p.value)} style={{display:'flex',alignItems:'center',gap:7,padding:'8px 13px',borderRadius:10,border:`1px solid ${platform===p.value?C.borderHi:C.border}`,background:platform===p.value?C.accentLo:'transparent',color:platform===p.value?'#c4b5fd':C.muted,cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit',transition:'all .15s'}}>
                <i className={`fa-brands ${p.icon}`}/>{p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Lbl>Ton</Lbl>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {TONES.map(t=>(
              <button key={t.value} onClick={()=>setTone(t.value)} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 12px',borderRadius:10,border:`1px solid ${tone===t.value?C.borderHi:C.border}`,background:tone===t.value?C.accentLo:'transparent',color:tone===t.value?'#c4b5fd':C.muted,cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'inherit',transition:'all .15s'}}>
                <i className={`fa-solid ${t.icon}`} style={{fontSize:11}}/>{t.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Tabs par section */}
      <div style={{marginBottom:20}}>
        {CATS.map(cat=>{
          const catTabs = ALL_TABS.filter(t=>t.cat===cat.key);
          if(!catTabs.length) return null;
          return (
            <div key={cat.key} style={{marginBottom:12}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <div style={{height:1,width:12,background:`${cat.color}30`}}/>
                <i className={`fa-solid ${cat.icon}`} style={{fontSize:10,color:cat.color}}/>
                <span style={{fontSize:10,fontWeight:800,color:cat.color,textTransform:'uppercase',letterSpacing:'1.5px'}}>{cat.key}</span>
                <div style={{height:1,flex:1,background:`${cat.color}15`}}/>
              </div>
              <div className="tab-scroll" style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {catTabs.map(t=>{
                  const locked = PLAN_LEVEL[effectivePlan] < PLAN_LEVEL[t.plan];
                  const isActive = tab===t.id;
                  return (
                    <button key={t.id} onClick={()=>{setTab(t.id);setResult(null);setError('');}} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 13px',borderRadius:10,border:`1px solid ${isActive?C.borderHi:C.border}`,background:isActive?C.accentLo:'transparent',color:isActive?'#c4b5fd':locked?C.subtle:C.muted,cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'inherit',transition:'all .15s',whiteSpace:'nowrap'}}>
                      <i className={`fa-solid ${t.icon}`} style={{fontSize:11,color:isActive?C.accent:locked?C.subtle:C.muted}}/>
                      {t.label}
                      {locked && <i className="fa-solid fa-lock" style={{fontSize:9,color:PLAN_COLOR[t.plan]}}/>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab header */}
      {tabInfo && (
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,padding:'12px 16px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:12}}>
          <div style={{width:34,height:34,borderRadius:9,background:C.accentLo,border:`1px solid ${C.borderHi}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <i className={`fa-solid ${tabInfo.icon}`} style={{color:C.accent,fontSize:14}}/>
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:15}}>{tabInfo.label}</div>
            <div style={{fontSize:11,color:C.muted}}>{tabInfo.desc}</div>
          </div>
          {tabInfo.plan !== 'free' && (
            <div style={{marginLeft:'auto',padding:'4px 10px',borderRadius:999,background:`${PLAN_COLOR[tabInfo.plan]}15`,border:`1px solid ${PLAN_COLOR[tabInfo.plan]}35`,color:PLAN_COLOR[tabInfo.plan],fontSize:11,fontWeight:700}}>
              {PLAN_LABEL[tabInfo.plan]}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{animation:'fadeIn .2s ease'}}>
        {renderContent()}
      </div>
    </div>
  );
}
