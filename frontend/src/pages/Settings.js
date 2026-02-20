import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const C = { bg:'#07070e', card:'#141422', border:'rgba(255,255,255,0.08)', accent:'#7C5CFC', muted:'#6A6A8E', text:'#EEEEFF' };

const Card = ({ children, style }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24, marginBottom:16, ...style }}>{children}</div>
);

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom:16 }}>
    <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'1px', marginBottom:7 }}>{label}</div>
    <input {...props} style={{ width:'100%', padding:'12px 14px', background:'rgba(255,255,255,0.05)', border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
  </div>
);

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!name.trim()) return;
    setLoading(true); setError(''); setSaved(false);
    try {
      await api.put('/user/profile', { name });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur de sauvegarde');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'Outfit','Inter',sans-serif", padding:'28px 20px', maxWidth:600, margin:'0 auto' }}>
      <div style={{ fontSize:28, fontWeight:800, marginBottom:4 }}>⚙️ Paramètres</div>
      <div style={{ color:C.muted, fontSize:15, marginBottom:28 }}>Gérez votre compte</div>

      <Card>
        <div style={{ fontWeight:700, fontSize:16, marginBottom:16 }}>Informations personnelles</div>
        <Input label="Nom" value={name} onChange={e => setName(e.target.value)} />
        <Input label="Email" value={user?.email || ''} disabled style={{ opacity:.5 }} />

        {error && <div style={{ color:'#FF5C5C', fontSize:13, marginBottom:12 }}>❌ {error}</div>}
        {saved && <div style={{ color:'#00D68F', fontSize:13, marginBottom:12 }}>✅ Sauvegardé !</div>}

        <button onClick={save} disabled={loading} style={{ padding:'12px 24px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', color:'white', cursor: loading ? 'not-allowed' : 'pointer', fontSize:14, fontWeight:700, fontFamily:'inherit', opacity: loading ? .6 : 1 }}>
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </Card>

      <Card>
        <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>Votre plan</div>
        <div style={{ fontSize:14, color:C.muted, marginBottom:12 }}>
          Plan actuel : <strong style={{ color:C.text, textTransform:'capitalize' }}>{user?.subscription?.plan || 'Free'}</strong>
        </div>
        <a href="/dashboard/billing" style={{ display:'inline-block', padding:'11px 22px', borderRadius:12, background:'rgba(124,92,252,0.12)', border:'1px solid rgba(124,92,252,0.3)', color:'#a89fff', textDecoration:'none', fontSize:14, fontWeight:700 }}>
          Gérer mon abonnement →
        </a>
      </Card>
    </div>
  );
}
