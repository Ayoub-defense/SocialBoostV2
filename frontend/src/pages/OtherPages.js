// ─── Scheduler Page ───────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export function Scheduler() {
  const [posts, setPosts] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const y = selectedDate.getFullYear();
    const m = selectedDate.getMonth() + 1;
    api.get(`/content/calendar/${y}/${m}`).then(r => setPosts(r.data.posts || [])).catch(console.error);
    api.get('/scheduler/upcoming').then(r => setUpcoming(r.data.posts || [])).catch(console.error);
  }, [selectedDate]);

  return (
    <div>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:28, fontWeight:800 }}>📅 Planification automatique</h1>
        <p style={{ color:'#94a3b8', marginTop:4 }}>Programmez vos posts aux meilleurs moments</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:24 }}>
        {/* Calendar placeholder */}
        <div className="card">
          <h3 style={{ fontSize:16, marginBottom:20 }}>
            📆 {selectedDate.toLocaleString('fr-FR', { month:'long', year:'numeric' })}
          </h3>
          {/* Simple month grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8, textAlign:'center' }}>
            {['Lu','Ma','Me','Je','Ve','Sa','Di'].map(d => (
              <div key={d} style={{ fontSize:11, fontWeight:700, color:'#94a3b8', padding:'8px 0' }}>{d}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
              const day = i - (firstDay === 0 ? 6 : firstDay - 1) + 1;
              const inMonth = day > 0 && day <= new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
              const dayPosts = inMonth ? posts.filter(p => new Date(p.scheduledAt || p.publishedAt).getDate() === day) : [];
              return (
                <div key={i} style={{
                  padding:'8px 4px', borderRadius:8, minHeight:44,
                  background: dayPosts.length > 0 ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                  border: dayPosts.length > 0 ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
                  color: inMonth ? '#f1f5f9' : '#475569',
                  fontSize:13, fontWeight: inMonth ? 500 : 400,
                  cursor: inMonth ? 'pointer' : 'default'
                }}>
                  {inMonth ? day : ''}
                  {dayPosts.length > 0 && (
                    <div style={{ width:6, height:6, background:'#8b5cf6', borderRadius:'50%', margin:'2px auto 0' }} />
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop:16, display:'flex', gap:8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth()-1))}>◀ Mois précédent</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth()+1))}>Mois suivant ▶</button>
          </div>
        </div>

        {/* Upcoming */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card">
            <h3 style={{ fontSize:15, marginBottom:16 }}>⏰ Prochaines publications</h3>
            {upcoming.length === 0 ? (
              <div style={{ textAlign:'center', color:'#475569', padding:24 }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
                <div>Aucun post planifié</div>
              </div>
            ) : upcoming.map(post => (
              <div key={post._id} style={{ padding:12, background:'rgba(255,255,255,0.03)', borderRadius:10, marginBottom:8 }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                  <span>{post.platform === 'instagram' ? '📸' : '🎵'}</span>
                  <span className="badge badge-purple">{post.platform}</span>
                </div>
                <div style={{ fontSize:12, color:'#e2e8f0', marginBottom:4 }}>{post.caption?.slice(0,60)}...</div>
                <div style={{ fontSize:11, color:'#8b5cf6', fontWeight:600 }}>
                  {new Date(post.scheduledAt).toLocaleString('fr-FR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="card">
            <h3 style={{ fontSize:15, marginBottom:16 }}>🕐 Meilleurs horaires Instagram</h3>
            {[['Lundi','07:00, 12:00, 19:00'],['Mercredi','11:00, 15:00, 20:00'],['Vendredi','10:00, 13:00, 18:00'],['Samedi','09:00, 14:00, 21:00']].map(([d,t]) => (
              <div key={d} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize:13 }}>{d}</span>
                <span style={{ fontSize:12, color:'#8b5cf6', fontWeight:600 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Page ───────────────────────────────────────────────────────────
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export function Analytics() {
  const [data, setData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    api.get('/analytics/dashboard').then(r => setData(r.data)).catch(console.error);
    api.get('/analytics/timeline?days=30').then(r => setTimeline(r.data.timeline || [])).catch(console.error);
    api.get('/analytics/recommendations').then(r => setRecommendations(r.data.recommendations || [])).catch(console.error);
  }, []);

  if (!data) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><div className="spinner"/></div>;

  return (
    <div>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:28, fontWeight:800 }}>📊 Analytiques & Performance</h1>
        <p style={{ color:'#94a3b8', marginTop:4 }}>Suivez votre croissance et optimisez votre stratégie</p>
      </div>

      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          ['📝 Posts total', data.stats?.totalPosts || 0, '#8b5cf6'],
          ['❤️ Total likes', (data.stats?.totalLikes || 0).toLocaleString(), '#ec4899'],
          ['💬 Commentaires', (data.stats?.totalComments || 0).toLocaleString(), '#6366f1'],
          ['📈 Engagement', `${data.stats?.avgEngagement || 0}%`, '#10b981'],
        ].map(([l,v,c]) => (
          <div key={l} className="card">
            <div style={{ fontSize:12, color:'#94a3b8', marginBottom:8 }}>{l}</div>
            <div style={{ fontSize:30, fontWeight:800, color:c }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="card">
          <h3 style={{ fontSize:15, marginBottom:20 }}>Posts publiés / 30 jours</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timeline.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill:'#94a3b8', fontSize:11 }} tickFormatter={v => v?.slice(8)} />
              <YAxis tick={{ fill:'#94a3b8', fontSize:11 }} />
              <Tooltip contentStyle={{ background:'#16161f', border:'1px solid rgba(139,92,246,0.3)', borderRadius:8 }} />
              <Bar dataKey="posts" fill="#8b5cf6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ fontSize:15, marginBottom:20 }}>Likes / 30 jours</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeline.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill:'#94a3b8', fontSize:11 }} tickFormatter={v => v?.slice(8)} />
              <YAxis tick={{ fill:'#94a3b8', fontSize:11 }} />
              <Tooltip contentStyle={{ background:'#16161f', border:'1px solid rgba(139,92,246,0.3)', borderRadius:8 }} />
              <Line type="monotone" dataKey="likes" stroke="#ec4899" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize:15, marginBottom:20 }}>🤖 Recommandations IA personnalisées</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {recommendations.map((r, i) => (
              <div key={i} style={{ display:'flex', gap:16, padding:16, background:'rgba(255,255,255,0.03)', borderRadius:12 }}>
                <div style={{
                  width:36, height:36, borderRadius:10, flexShrink:0,
                  background: r.priority === 'high' ? 'rgba(239,68,68,0.2)' : r.priority === 'medium' ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.2)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:16
                }}>
                  {r.priority === 'high' ? '🔴' : r.priority === 'medium' ? '🟡' : '🟢'}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{r.title}</div>
                  <div style={{ fontSize:13, color:'#94a3b8' }}>{r.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Messages Page ────────────────────────────────────────────────────────────
export function Messages() {
  const [message, setMessage] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!message) return toast.error('Entrez un message');
    setLoading(true);
    try {
      const res = await api.post('/ai/analyze-message', { message, businessContext: context });
      setResult(res.data);
    } catch {
      toast.error('Erreur analyse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:28, fontWeight:800 }}>💬 Réponses IA aux messages</h1>
        <p style={{ color:'#94a3b8', marginTop:4 }}>L'IA analyse et répond à vos DM Instagram/TikTok</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        <div className="card">
          <h3 style={{ fontSize:15, marginBottom:20 }}>🧪 Tester une réponse IA</h3>
          <div style={{ marginBottom:16 }}>
            <label className="label">Contexte de votre business</label>
            <input className="input" placeholder="Ex: Boutique de chaussures de luxe Paris" value={context} onChange={e => setContext(e.target.value)} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label className="label">Message reçu (simulé)</label>
            <textarea className="textarea" placeholder="Ex: Bonjour, vous livrez en dehors de Paris ?" value={message} onChange={e => setMessage(e.target.value)} style={{ minHeight:120 }} />
          </div>
          <button className="btn btn-primary" onClick={analyze} disabled={loading} style={{ width:'100%', justifyContent:'center' }}>
            {loading ? '⏳ Analyse en cours...' : '🤖 Analyser et répondre'}
          </button>
        </div>

        <div className="card">
          <h3 style={{ fontSize:15, marginBottom:20 }}>📤 Réponse générée</h3>
          {result ? (
            <div>
              <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
                <span className="badge badge-purple">Intent: {result.intent}</span>
                {result.isUrgent && <span className="badge badge-red">🚨 URGENT</span>}
                <span className="badge badge-orange">Score: {result.urgencyScore}/10</span>
              </div>
              <div style={{ padding:16, background:'rgba(139,92,246,0.1)', borderRadius:12, border:'1px solid rgba(139,92,246,0.2)', fontSize:14, lineHeight:1.7, marginBottom:16 }}>
                {result.reply}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(result.reply); toast.success('Copié !'); }}>
                📋 Copier la réponse
              </button>
            </div>
          ) : (
            <div style={{ textAlign:'center', color:'#475569', padding:48 }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🤖</div>
              <div>Saisissez un message et cliquez sur Analyser</div>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop:24 }}>
        <h3 style={{ fontSize:15, marginBottom:16 }}>ℹ️ Comment ça fonctionne</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {[
            ['1. Réception','Le client envoie un DM sur Instagram ou TikTok','📨'],
            ['2. Analyse IA','L\'IA détecte l\'intention et le niveau d\'urgence','🧠'],
            ['3. Réponse auto','Une réponse personnalisée est envoyée en quelques secondes','⚡'],
          ].map(([t,d,i]) => (
            <div key={t} style={{ padding:16, background:'rgba(255,255,255,0.03)', borderRadius:12, textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>{i}</div>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:6 }}>{t}</div>
              <div style={{ fontSize:12, color:'#94a3b8' }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────
export function Settings() {
  const { user, updateUser } = require('../context/AuthContext').useAuth();
  const [form, setForm] = useState({ name: user?.name || '', tone: user?.settings?.tone || 'professional', language: user?.settings?.language || 'fr', timezone: user?.settings?.timezone || 'Europe/Paris' });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      const res = await api.put('/user/profile', { name: form.name, settings: { tone: form.tone, language: form.language, timezone: form.timezone } });
      updateUser(res.data.user);
      toast.success('Paramètres sauvegardés !');
    } catch {
      toast.error('Erreur sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:28, fontWeight:800 }}>⚙️ Paramètres</h1>
      </div>
      <div style={{ maxWidth:600 }}>
        <div className="card" style={{ marginBottom:20 }}>
          <h3 style={{ fontSize:15, marginBottom:20 }}>👤 Profil</h3>
          <div style={{ marginBottom:16 }}>
            <label className="label">Nom</label>
            <input className="input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
          </div>
          <div style={{ marginBottom:16 }}>
            <label className="label">Email</label>
            <input className="input" value={user?.email} disabled style={{ opacity:0.5 }} />
          </div>
        </div>
        
        <div className="card" style={{ marginBottom:20 }}>
          <h3 style={{ fontSize:15, marginBottom:20 }}>🎨 Préférences IA</h3>
          <div style={{ marginBottom:16 }}>
            <label className="label">Ton par défaut</label>
            <select className="select" value={form.tone} onChange={e => setForm(p => ({...p, tone: e.target.value}))}>
              {[['professional','💼 Professionnel'],['fun','🎉 Fun'],['luxury','💎 Luxe'],['young','🔥 Jeune'],['neutral','⚖️ Neutre']].map(([v,l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom:16 }}>
            <label className="label">Langue</label>
            <select className="select" value={form.language} onChange={e => setForm(p => ({...p, language: e.target.value}))}>
              <option value="fr">🇫🇷 Français</option>
              <option value="en">🇬🇧 English</option>
              <option value="es">🇪🇸 Español</option>
            </select>
          </div>
        </div>
        
        <button className="btn btn-primary" onClick={save} disabled={loading}>
          {loading ? '⏳ Sauvegarde...' : '💾 Sauvegarder les paramètres'}
        </button>
      </div>
    </div>
  );
}
