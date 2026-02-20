import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const C = { bg:'#05050f', card:'#0d0d1e', border:'rgba(255,255,255,0.07)', accent:'#7C5CFC', accentBo:'rgba(124,92,252,0.35)', text:'#F0F0FF', muted:'#5a5a8a', green:'#00D68F', yellow:'#FFB800' };

const PLANS = [
  {
    id:'free', name:'Gratuit', price:0, desc:'Pour commencer',
    color:'#6A6A8E', icon:'fa-user',
    features:['3 générations/mois','Légendes + hashtags','Offre promo IA','Réponses aux avis Google'],
    cta:'Commencer gratuitement', ctaLink:'/register',
  },
  {
    id:'starter', name:'Starter', price:5, desc:'Pour les indépendants',
    color:'#a78bfa', icon:'fa-bolt',
    features:['50 générations/mois','Tout du plan Gratuit','Semaine IA complète (7 posts)','Bio Instagram / TikTok','Script vidéo TikTok','Image IA (Pollinations)','Stories (séquence 5 slides)','Persona client IA'],
    cta:'Commencer à 5€/mois', lsVariant:'starter',
  },
  {
    id:'pro', name:'Pro', price:12, desc:'Pour les petites entreprises', popular:true,
    color:'#8b5cf6', icon:'fa-fire',
    features:['Générations illimitées','Tout du plan Starter','30 idées de posts/mois','Réponses aux commentaires','Stratégie 90 jours','Plan de lancement produit','Email de relance client','Stratégie anti-concurrent','🤖 Simulateur de client IA'],
    cta:'Commencer à 12€/mois', lsVariant:'pro',
  },
  {
    id:'agency', name:'Agency', price:20, desc:'Pour les agences',
    color:'#FFB800', icon:'fa-crown',
    features:['Tout du plan Pro','Audit de bio (score /100)','Série de 5 posts (formats variés)','Traduction culturelle (5 langues)','Hooks viraux (15 accroches)','Support prioritaire'],
    cta:'Commencer à 20€/mois', lsVariant:'agency',
  },
];

export default function Pricing({ inApp }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState('');
  const currentPlan = user?.subscription?.plan || 'free';
  const isActive = user?.subscription?.status === 'active' || user?.subscription?.status === 'trialing';

  const handlePlan = async (plan) => {
    if (!user) { navigate('/register'); return; }
    if (plan.id === 'free') return;
    if (plan.id === currentPlan && isActive) { toast('Tu es déjà sur ce plan !'); return; }
    setLoading(plan.id);
    try {
      const r = await api.post('/payments/create-checkout', { planId:plan.id });
      if (r.data.checkoutUrl) window.location.href = r.data.checkoutUrl;
      else toast.error('Erreur lors de la création du paiement');
    } catch(e) {
      toast.error(e.response?.data?.error || 'Erreur paiement');
    }
    setLoading('');
  };

  const Wrapper = inApp ? React.Fragment : ({ children }) => (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:"'Outfit',sans-serif" }}>
      <nav style={{ position:'sticky', top:0, zIndex:100, padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(5,5,15,0.9)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none' }}>
          <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="fa-solid fa-bolt" style={{ color:'white', fontSize:13 }} />
          </div>
          <span style={{ fontWeight:800, fontSize:16, color:C.text }}>SocialBoost AI</span>
        </Link>
        {!user && (
          <div style={{ display:'flex', gap:10 }}>
            <Link to="/login" style={{ padding:'8px 18px', borderRadius:9, border:`1px solid ${C.border}`, color:C.text, textDecoration:'none', fontSize:13, fontWeight:600 }}>Connexion</Link>
            <Link to="/register" style={{ padding:'8px 18px', borderRadius:9, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', color:'white', textDecoration:'none', fontSize:13, fontWeight:700 }}>Essai gratuit</Link>
          </div>
        )}
      </nav>
      {children}
    </div>
  );

  return (
    <Wrapper>
      <div style={{ maxWidth:1100, margin:'0 auto', padding: inApp ? '28px 20px' : '80px 24px' }}>
        {!inApp && (
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 14px', borderRadius:999, background:'rgba(124,92,252,0.1)', border:'1px solid rgba(124,92,252,0.25)', color:'#a89fff', fontSize:11, fontWeight:700, marginBottom:20, textTransform:'uppercase', letterSpacing:'1px' }}>
              <i className="fa-solid fa-tag" style={{ fontSize:9 }} />Tarifs transparents, sans surprise
            </div>
            <h1 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:900, color:C.text, marginBottom:14, letterSpacing:'-1px' }}>Un abonnement simple,<br/>des résultats concrets</h1>
            <p style={{ fontSize:16, color:C.muted }}>7 jours d'essai gratuit sur tous les plans payants. Résiliez à tout moment.</p>
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))', gap:16 }}>
          {PLANS.map(plan => {
            const isCurrent = currentPlan === plan.id && (plan.id === 'free' || isActive);
            return (
              <div key={plan.id} style={{ position:'relative', background: plan.popular ? 'linear-gradient(180deg,rgba(124,92,252,0.18),rgba(90,64,212,0.08))' : C.card, border:`1px solid ${plan.popular ? 'rgba(124,92,252,0.5)' : isCurrent ? plan.color+'44' : C.border}`, borderRadius:20, padding:24, display:'flex', flexDirection:'column', boxShadow: plan.popular ? '0 0 40px rgba(124,92,252,0.12)' : 'none', transition:'transform .2s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='none'}>

                {plan.popular && (
                  <div style={{ position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)', padding:'5px 16px', borderRadius:999, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', color:'white', fontSize:11, fontWeight:800, whiteSpace:'nowrap', boxShadow:'0 4px 14px rgba(124,92,252,0.4)' }}>
                    ⭐ Le plus populaire
                  </div>
                )}

                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                  <div style={{ width:38, height:38, borderRadius:11, background:`${plan.color}18`, border:`1px solid ${plan.color}35`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <i className={`fa-solid ${plan.icon}`} style={{ color:plan.color, fontSize:16 }} />
                  </div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:16, color:C.text }}>{plan.name}</div>
                    <div style={{ fontSize:11, color:C.muted }}>{plan.desc}</div>
                  </div>
                </div>

                <div style={{ marginBottom:20 }}>
                  <span style={{ fontSize:40, fontWeight:900, color:C.text, letterSpacing:'-1px' }}>{plan.price}€</span>
                  {plan.price > 0 && <span style={{ fontSize:13, color:C.muted }}>/mois</span>}
                  {plan.price === 0 && <span style={{ fontSize:13, color:C.muted }}> pour toujours</span>}
                </div>

                <div style={{ flex:1, marginBottom:22 }}>
                  {plan.features.map((feat,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:9, marginBottom:9 }}>
                      <i className="fa-solid fa-check" style={{ color:plan.color, fontSize:11, marginTop:3, flexShrink:0 }} />
                      <span style={{ fontSize:13, color:'#c0c0e0', lineHeight:1.4 }}>{feat}</span>
                    </div>
                  ))}
                </div>

                {isCurrent ? (
                  <div style={{ padding:'11px', borderRadius:11, border:`1px solid ${plan.color}44`, background:`${plan.color}10`, color:plan.color, fontSize:13, fontWeight:700, textAlign:'center' }}>
                    <i className="fa-solid fa-circle-check" style={{ marginRight:6 }} />Plan actuel
                  </div>
                ) : plan.id === 'free' ? (
                  <Link to="/register" style={{ display:'block', padding:'11px', borderRadius:11, border:`1px solid ${C.border}`, color:C.text, fontSize:13, fontWeight:700, textAlign:'center', textDecoration:'none', transition:'all .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=C.accentBo}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                    {plan.cta}
                  </Link>
                ) : (
                  <button onClick={()=>handlePlan(plan)} disabled={!!loading} style={{ width:'100%', padding:'12px', borderRadius:11, background:`linear-gradient(135deg,${plan.color},${plan.color}bb)`, color:'white', border:'none', fontSize:13, fontWeight:800, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', opacity:loading===plan.id?0.7:1, boxShadow:`0 4px 16px ${plan.color}35`, display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                    {loading===plan.id ? <><i className="fa-solid fa-spinner fa-spin" />Chargement...</> : <>{plan.cta}</>}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {!inApp && (
          <div style={{ marginTop:50, textAlign:'center' }}>
            <div style={{ display:'flex', justifyContent:'center', gap:24, flexWrap:'wrap', fontSize:13, color:C.muted }}>
              {['Paiement sécurisé via Lemon Squeezy','SSL 256-bit','Remboursement 7 jours','Annulation en 1 clic'].map((t,i)=>(
                <span key={i}><i className="fa-solid fa-shield-halved" style={{ color:C.green, marginRight:6 }}/>{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Wrapper>
  );
}
