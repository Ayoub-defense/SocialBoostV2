import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const C = {
  bg:'#05050f', card:'#0d0d1e', border:'rgba(255,255,255,0.07)',
  accent:'#7C5CFC', accentLo:'rgba(124,92,252,0.12)', accentBo:'rgba(124,92,252,0.35)',
  text:'#F0F0FF', muted:'#5a5a8a', green:'#00D68F', yellow:'#FFB800',
};

const FEATURES = [
  { icon:'fa-pen-nib',         title:'Légendes IA',          desc:'Légendes + hashtags SEO optimisés en 10 secondes. Jamais la page blanche.',          plan:'Gratuit' },
  { icon:'fa-calendar-week',   title:'Semaine complète',      desc:'7 posts générés d\'un coup. Un mois de contenu en 5 minutes.',                        plan:'Starter' },
  { icon:'fa-clapperboard',    title:'Script TikTok',         desc:'Hook + contenu + CTA prêt à tourner. Plus besoin de chercher quoi dire.',             plan:'Starter' },
  { icon:'fa-robot',           title:'Simulateur client',     desc:'Entraîne-toi à vendre face à un client IA avec de vraies objections.',                plan:'Pro' },
  { icon:'fa-chart-line',      title:'Stratégie 90 jours',   desc:'Plan complet sur 3 mois avec objectifs, KPIs et planning semaine par semaine.',        plan:'Pro' },
  { icon:'fa-rocket',          title:'Plan de lancement',     desc:'Séquence complète pour lancer un produit : teaser, révélation, post-lancement.',       plan:'Pro' },
  { icon:'fa-magnifying-glass',title:'Audit de bio',          desc:'Score + analyse + version améliorée de ta bio. Prêt à copier-coller.',                plan:'Agency' },
  { icon:'fa-language',        title:'Traduction culturelle', desc:'Tes posts traduits ET adaptés culturellement en 5 langues.',                           plan:'Agency' },
  { icon:'fa-bolt',            title:'Hooks viraux',          desc:'10 accroches qui stoppent le scroll, avec la technique utilisée expliquée.',           plan:'Agency' },
];

const TESTIMONIALS = [
  { name:'Sarah M.', role:'Boutique mode · Lyon', text:'En 3 semaines j\'ai doublé mon engagement Instagram. Je génère ma semaine de posts en 5 minutes le lundi matin.', stars:5 },
  { name:'Karim B.', role:'Coach fitness · Paris', text:'Le simulateur client m\'a aidé à répondre aux objections. Mes conversions ont augmenté de 40% en un mois.', stars:5 },
  { name:'Julie R.', role:'Salon de coiffure · Bordeaux', text:'Je n\'avais aucune idée de quoi poster. Maintenant j\'ai un plan sur 3 mois et mes clients me disent qu\'ils me voient partout.', stars:5 },
];

const PLAN_COLOR = { Gratuit:C.muted, Starter:'#a78bfa', Pro:'#8b5cf6', Agency:'#FFB800' };

export default function LandingPage() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = 2847;
    const step = Math.ceil(target / 60);
    const interval = setInterval(() => {
      setCount(c => { if (c + step >= target) { clearInterval(interval); return target; } return c + step; });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'Outfit',sans-serif" }}>

      {/* Nav */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(5,5,15,0.85)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(124,92,252,0.4)' }}>
            <i className="fa-solid fa-bolt" style={{ color:'white', fontSize:15 }} />
          </div>
          <span style={{ fontWeight:800, fontSize:17, letterSpacing:'-0.3px' }}>SocialBoost AI</span>
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <Link to="/pricing" style={{ color:C.muted, textDecoration:'none', fontSize:14, fontWeight:500 }}>Tarifs</Link>
          <Link to="/login" style={{ color:C.text, textDecoration:'none', fontSize:14, fontWeight:600 }}>Connexion</Link>
          <Link to="/register" style={{ padding:'9px 20px', borderRadius:10, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', color:'white', textDecoration:'none', fontSize:14, fontWeight:700, boxShadow:'0 4px 14px rgba(124,92,252,0.35)' }}>
            Commencer gratuitement
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop:140, paddingBottom:100, textAlign:'center', maxWidth:800, margin:'0 auto', padding:'140px 24px 100px' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:999, background:C.accentLo, border:`1px solid ${C.accentBo}`, color:'#a89fff', fontSize:12, fontWeight:700, marginBottom:28, textTransform:'uppercase', letterSpacing:'1px' }}>
          <i className="fa-solid fa-star" style={{ fontSize:10 }} />
          Plus de {count.toLocaleString('fr')} créateurs font confiance à SocialBoost AI
        </div>
        <h1 style={{ fontSize:'clamp(36px,6vw,68px)', fontWeight:900, lineHeight:1.1, marginBottom:22, letterSpacing:'-1.5px' }}>
          Arrête de perdre des heures<br />
          <span style={{ background:'linear-gradient(135deg,#7C5CFC,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>à chercher quoi poster</span>
        </h1>
        <p style={{ fontSize:'clamp(16px,2vw,20px)', color:C.muted, lineHeight:1.7, marginBottom:36, maxWidth:580, margin:'0 auto 36px' }}>
          L'IA génère tes légendes, scripts TikTok, stratégie 90 jours et plan de lancement en quelques secondes. Zéro compétence requise.
        </p>
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/register" style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'15px 32px', borderRadius:14, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', color:'white', textDecoration:'none', fontSize:16, fontWeight:800, boxShadow:'0 8px 30px rgba(124,92,252,0.4)', letterSpacing:'-0.3px' }}>
            <i className="fa-solid fa-bolt" />
            Commencer gratuitement
          </Link>
          <Link to="/pricing" style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'15px 28px', borderRadius:14, border:'1px solid rgba(255,255,255,0.1)', color:C.text, textDecoration:'none', fontSize:15, fontWeight:600 }}>
            Voir les tarifs <i className="fa-solid fa-arrow-right" style={{ fontSize:12 }} />
          </Link>
        </div>
        <div style={{ marginTop:28, fontSize:13, color:C.muted, display:'flex', justifyContent:'center', gap:20, flexWrap:'wrap' }}>
          {['Sans carte bancaire','Annulable à tout moment','Résultats en 30 secondes'].map((t,i)=>(
            <span key={i}><i className="fa-solid fa-circle-check" style={{ color:C.green, marginRight:6 }}/>{t}</span>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding:'60px 24px', borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:40, textAlign:'center' }}>
          {[
            { n:'+2 847', l:'Créateurs actifs' },
            { n:'19', l:'Outils IA inclus' },
            { n:'30s', l:'Temps de génération' },
            { n:'4.9/5', l:'Note moyenne' },
          ].map((s,i)=>(
            <div key={i}>
              <div style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:900, color:'#fff', marginBottom:6, background:'linear-gradient(135deg,#7C5CFC,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{s.n}</div>
              <div style={{ fontSize:14, color:C.muted }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section style={{ padding:'100px 24px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.accent, textTransform:'uppercase', letterSpacing:'2px', marginBottom:14 }}>19 OUTILS IA</div>
          <h2 style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:900, letterSpacing:'-1px', marginBottom:14 }}>Tout ce dont tu as besoin</h2>
          <p style={{ fontSize:16, color:C.muted, maxWidth:500, margin:'0 auto' }}>Des outils pensés pour les vrais créateurs et entrepreneurs, pas pour les agences à 10 000€/mois.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
          {FEATURES.map((f,i)=>(
            <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24, transition:'all .2s', cursor:'default', position:'relative' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.accentBo; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform='none'; }}>
              <div style={{ position:'absolute', top:16, right:16, padding:'3px 10px', borderRadius:999, background:PLAN_COLOR[f.plan]+'18', border:`1px solid ${PLAN_COLOR[f.plan]}35`, color:PLAN_COLOR[f.plan], fontSize:10, fontWeight:700 }}>{f.plan}</div>
              <div style={{ width:44, height:44, borderRadius:12, background:C.accentLo, border:'1px solid rgba(124,92,252,0.2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                <i className={`fa-solid ${f.icon}`} style={{ color:C.accent, fontSize:18 }} />
              </div>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>{f.title}</div>
              <div style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding:'80px 24px', background:'rgba(124,92,252,0.04)', borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:50 }}>
            <h2 style={{ fontSize:'clamp(24px,3vw,38px)', fontWeight:900, letterSpacing:'-0.8px', marginBottom:10 }}>Ils ont arrêté de ramer</h2>
            <p style={{ color:C.muted, fontSize:15 }}>Des résultats concrets, pas des promesses.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
                <div style={{ marginBottom:14 }}>{Array(t.stars).fill('⭐').join('')}</div>
                <p style={{ fontSize:14, lineHeight:1.75, color:'#d0d0ee', marginBottom:18, fontStyle:'italic' }}>"{t.text}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:15, color:'white' }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{t.name}</div>
                    <div style={{ fontSize:11, color:C.muted }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ padding:'100px 24px', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <div style={{ width:64, height:64, borderRadius:18, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', boxShadow:'0 8px 30px rgba(124,92,252,0.4)' }}>
            <i className="fa-solid fa-bolt" style={{ color:'white', fontSize:28 }} />
          </div>
          <h2 style={{ fontSize:'clamp(26px,4vw,42px)', fontWeight:900, letterSpacing:'-1px', marginBottom:16 }}>
            Commence maintenant, <span style={{ color:C.accent }}>gratuitement</span>
          </h2>
          <p style={{ color:C.muted, fontSize:16, lineHeight:1.7, marginBottom:32 }}>
            Aucune carte bancaire requise. Accès immédiat à la génération de légendes et hashtags. Upgradez quand vous voulez.
          </p>
          <Link to="/register" style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'16px 36px', borderRadius:14, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', color:'white', textDecoration:'none', fontSize:16, fontWeight:800, boxShadow:'0 8px 30px rgba(124,92,252,0.4)' }}>
            <i className="fa-solid fa-rocket" />
            Créer mon compte gratuit
          </Link>
          <div style={{ marginTop:16, fontSize:12, color:C.muted }}>
            <i className="fa-solid fa-lock" style={{ marginRight:5 }} />
            Paiement sécurisé via Lemon Squeezy · SSL · Données protégées
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding:'32px 24px', borderTop:'1px solid rgba(255,255,255,0.05)', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:12 }}>
          <div style={{ width:26, height:26, borderRadius:7, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="fa-solid fa-bolt" style={{ color:'white', fontSize:11 }} />
          </div>
          <span style={{ fontWeight:700, fontSize:14 }}>SocialBoost AI</span>
        </div>
        <div style={{ fontSize:12, color:C.muted }}>© 2025 SocialBoost AI · Tous droits réservés</div>
      </footer>
    </div>
  );
}
