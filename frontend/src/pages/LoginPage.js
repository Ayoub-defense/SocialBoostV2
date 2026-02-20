import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const C = { bg:'#05050f', card:'#0d0d1e', border:'rgba(255,255,255,0.07)', accent:'#7C5CFC', accentBo:'rgba(124,92,252,0.35)', text:'#F0F0FF', muted:'#5a5a8a', red:'#FF5C5C', green:'#00D68F' };

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email:'', password:'' });
  const [twoFA, setTwoFA]     = useState('');
  const [needs2FA, setNeeds2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = k => e => setForm(f=>({ ...f, [k]:e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = { ...form, ...(needs2FA ? { twoFAToken:twoFA } : {}) };
      const r = await api.post('/auth/login', payload);
      if (r.data.requires2FA) { setNeeds2FA(true); setLoading(false); return; }
      login(r.data);
      navigate('/dashboard');
    } catch(err) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    }
    setLoading(false);
  };

  const inputStyle = { width:'100%', padding:'13px 16px', background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, borderRadius:11, color:C.text, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', transition:'border-color .15s' };
  const focusStyle = e => e.target.style.borderColor = C.accentBo;
  const blurStyle  = e => e.target.style.borderColor = C.border;

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Outfit',sans-serif" }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none' }}>
            <div style={{ width:42, height:42, borderRadius:13, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 20px rgba(124,92,252,0.4)' }}>
              <i className="fa-solid fa-bolt" style={{ color:'white', fontSize:18 }} />
            </div>
            <span style={{ fontWeight:800, fontSize:20, color:C.text }}>SocialBoost AI</span>
          </Link>
          <div style={{ marginTop:20 }}>
            <div style={{ fontWeight:800, fontSize:24, color:C.text, marginBottom:6 }}>{needs2FA ? 'Vérification A2F' : 'Connexion'}</div>
            <div style={{ fontSize:14, color:C.muted }}>{needs2FA ? 'Entrez le code de votre application Authenticator' : 'Bon retour parmi nous 👋'}</div>
          </div>
        </div>

        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:28 }}>
          <form onSubmit={submit}>
            {!needs2FA ? (
              <>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:8 }}>
                    <i className="fa-solid fa-envelope" style={{ marginRight:6 }} />Email
                  </div>
                  <input type="email" placeholder="ton@email.com" value={form.email} onChange={set('email')} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:8 }}>
                    <i className="fa-solid fa-lock" style={{ marginRight:6 }} />Mot de passe
                  </div>
                  <input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </>
            ) : (
              <div style={{ marginBottom:20, textAlign:'center' }}>
                <div style={{ fontSize:48, marginBottom:14 }}>🔐</div>
                <input type="text" placeholder="000000" value={twoFA} onChange={e=>setTwoFA(e.target.value)} maxLength={6}
                  style={{ ...inputStyle, textAlign:'center', fontSize:24, fontWeight:700, letterSpacing:8 }}
                  onFocus={focusStyle} onBlur={blurStyle} autoFocus />
                <div style={{ fontSize:12, color:C.muted, marginTop:10 }}>Code à 6 chiffres · Google Authenticator / Authy</div>
              </div>
            )}

            {error && (
              <div style={{ padding:'11px 14px', borderRadius:10, background:'rgba(255,92,92,0.08)', border:'1px solid rgba(255,92,92,0.25)', color:C.red, fontSize:13, marginBottom:14, display:'flex', gap:8 }}>
                <i className="fa-solid fa-circle-exclamation" />{error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width:'100%', padding:'13px', borderRadius:11, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', color:'white', border:'none', fontSize:15, fontWeight:800, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 18px rgba(124,92,252,0.35)' }}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin" />Connexion...</> : <><i className="fa-solid fa-right-to-bracket" />Se connecter</>}
            </button>
          </form>

          {needs2FA && (
            <button onClick={()=>setNeeds2FA(false)} style={{ width:'100%', padding:'10px', marginTop:10, background:'transparent', border:`1px solid ${C.border}`, borderRadius:10, color:C.muted, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>
              <i className="fa-solid fa-arrow-left" style={{ marginRight:6 }} />Retour
            </button>
          )}
        </div>

        <div style={{ textAlign:'center', marginTop:20, fontSize:14, color:C.muted }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color:C.accent, fontWeight:700, textDecoration:'none' }}>Créer un compte gratuit</Link>
        </div>
      </div>
    </div>
  );
}
