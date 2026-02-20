import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const C = { bg:'#05050f', card:'#0d0d1e', border:'rgba(255,255,255,0.07)', accent:'#7C5CFC', accentBo:'rgba(124,92,252,0.35)', text:'#F0F0FF', muted:'#5a5a8a', red:'#FF5C5C', green:'#00D68F' };

const PERKS = [
  { icon:'fa-bolt', text:'Accès immédiat — sans CB' },
  { icon:'fa-pen-nib', text:'Légendes + hashtags gratuits' },
  { icon:'fa-shield-halved', text:'Données sécurisées SSL' },
];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [strength, setStrength] = useState(0);

  const set = k => e => {
    setForm(f=>({ ...f, [k]:e.target.value }));
    if (k==='password') {
      const pw = e.target.value;
      let s = 0;
      if (pw.length >= 8) s++;
      if (/[A-Z]/.test(pw)) s++;
      if (/[0-9]/.test(pw)) s++;
      if (/[^A-Za-z0-9]/.test(pw)) s++;
      setStrength(s);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await api.post('/auth/register', form);
      login(r.data);
      navigate('/dashboard');
    } catch(err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    }
    setLoading(false);
  };

  const inputStyle = { width:'100%', padding:'13px 16px', background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, borderRadius:11, color:C.text, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', transition:'border-color .15s' };
  const f = e => e.target.style.borderColor = C.accentBo;
  const b = e => e.target.style.borderColor = C.border;
  const strengthColor = ['#3d3d6a','#FF5C5C','#FFB800','#a78bfa','#00D68F'][strength];
  const strengthLabel = ['','Faible','Moyen','Bon','Excellent'][strength];

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', fontFamily:"'Outfit',sans-serif" }}>
      {/* Left panel */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'40px 48px', maxWidth:480 }}>
        <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:9, textDecoration:'none', marginBottom:40 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="fa-solid fa-bolt" style={{ color:'white', fontSize:15 }} />
          </div>
          <span style={{ fontWeight:800, fontSize:17, color:C.text }}>SocialBoost AI</span>
        </Link>

        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:28, fontWeight:900, color:C.text, marginBottom:8, letterSpacing:'-0.5px' }}>Créer mon compte</h1>
          <p style={{ fontSize:14, color:C.muted }}>Gratuit · Accès immédiat · Sans carte bancaire</p>
        </div>

        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:26 }}>
          <form onSubmit={submit}>
            {[
              { k:'name', label:'Ton prénom', icon:'fa-user', type:'text', placeholder:'ex: Sophie' },
              { k:'email', label:'Email', icon:'fa-envelope', type:'email', placeholder:'ton@email.com' },
              { k:'password', label:'Mot de passe', icon:'fa-lock', type:'password', placeholder:'8 caractères minimum' },
            ].map(f2 => (
              <div key={f2.k} style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:7 }}>
                  <i className={`fa-solid ${f2.icon}`} style={{ marginRight:6 }} />{f2.label}
                </div>
                <input type={f2.type} placeholder={f2.placeholder} value={form[f2.k]} onChange={set(f2.k)} required
                  style={inputStyle} onFocus={f} onBlur={b} />
              </div>
            ))}

            {form.password.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ display:'flex', gap:4, marginBottom:5 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex:1, height:3, borderRadius:2, background:i<=strength?strengthColor:'rgba(255,255,255,0.08)', transition:'background .3s' }} />
                  ))}
                </div>
                <div style={{ fontSize:11, color:strengthColor, fontWeight:600 }}>
                  {strengthLabel && <><i className="fa-solid fa-shield-halved" style={{ marginRight:5 }} />{strengthLabel}</>}
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding:'11px 14px', borderRadius:10, background:'rgba(255,92,92,0.08)', border:'1px solid rgba(255,92,92,0.25)', color:C.red, fontSize:13, marginBottom:14, display:'flex', gap:8 }}>
                <i className="fa-solid fa-circle-exclamation" />{error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width:'100%', padding:'13px', borderRadius:11, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', color:'white', border:'none', fontSize:15, fontWeight:800, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 18px rgba(124,92,252,0.35)' }}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin" />Création...</> : <><i className="fa-solid fa-rocket" />Créer mon compte gratuit</>}
            </button>
          </form>
        </div>

        <div style={{ textAlign:'center', marginTop:18, fontSize:14, color:C.muted }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color:C.accent, fontWeight:700, textDecoration:'none' }}>Se connecter</Link>
        </div>
      </div>

      {/* Right panel — hidden on mobile */}
      <div style={{ flex:1, background:'linear-gradient(135deg,rgba(124,92,252,0.15),rgba(90,64,212,0.08))', borderLeft:'1px solid rgba(124,92,252,0.15)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:48 }} className="hide-mobile">
        <style>{`@media(max-width:768px){.hide-mobile{display:none!important}}`}</style>
        <div style={{ maxWidth:340, textAlign:'center' }}>
          <div style={{ fontSize:56, marginBottom:24 }}>⚡</div>
          <h2 style={{ fontSize:24, fontWeight:900, color:C.text, marginBottom:14, letterSpacing:'-0.5px' }}>Ce qui t'attend à l'intérieur</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:12, textAlign:'left', marginBottom:30 }}>
            {PERKS.map((p,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'rgba(124,92,252,0.1)', border:'1px solid rgba(124,92,252,0.2)', borderRadius:11 }}>
                <i className={`fa-solid ${p.icon}`} style={{ color:'#a78bfa', width:18, textAlign:'center' }} />
                <span style={{ fontSize:14, color:'#d0d0ee', fontWeight:500 }}>{p.text}</span>
              </div>
            ))}
          </div>
          <div style={{ padding:18, background:'rgba(0,214,143,0.07)', border:'1px solid rgba(0,214,143,0.2)', borderRadius:12 }}>
            <div style={{ fontSize:13, color:'#00D68F', fontWeight:600, marginBottom:4 }}>
              <i className="fa-solid fa-circle-check" style={{ marginRight:6 }} />
              Aucune carte bancaire requise
            </div>
            <div style={{ fontSize:12, color:C.muted }}>Tu peux upgrader plus tard quand tu es prêt.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
