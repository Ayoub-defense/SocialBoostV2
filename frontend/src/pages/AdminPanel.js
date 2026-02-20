import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const C = {
  bg:'#05050f', surface:'#0a0a16', card:'#0f0f1e', border:'rgba(255,255,255,0.07)',
  borderHi:'rgba(124,92,252,0.35)', accent:'#7C5CFC', accentLo:'rgba(124,92,252,0.1)',
  text:'#F0F0FF', muted:'#5a5a8a', subtle:'#2d2d5a',
  green:'#00D68F', red:'#FF5C5C', yellow:'#FFB800', orange:'#FF6B35',
};
const PLAN_COLOR = { free:'#6A6A8E', starter:'#a78bfa', pro:'#8b5cf6', agency:'#FFB800' };
const PLAN_ICON  = { free:'fa-user', starter:'fa-bolt', pro:'fa-fire', agency:'fa-crown' };
const PLANS = ['free','starter','pro','agency'];

const Badge = ({ plan }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:999, background:`${PLAN_COLOR[plan]}18`, border:`1px solid ${PLAN_COLOR[plan]}35`, color:PLAN_COLOR[plan], fontSize:11, fontWeight:700 }}>
    <i className={`fa-solid ${PLAN_ICON[plan]}`} style={{ fontSize:9 }} />{plan}
  </span>
);

const StatCard = ({ icon, label, value, color, sub }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20, flex:1 }}>
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
      <div style={{ width:38, height:38, borderRadius:10, background:`${color}15`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <i className={`fa-solid ${icon}`} style={{ color, fontSize:15 }} />
      </div>
      <div style={{ fontSize:12, color:C.muted, fontWeight:600, textTransform:'uppercase', letterSpacing:'1px' }}>{label}</div>
    </div>
    <div style={{ fontSize:30, fontWeight:900, color:C.text }}>{value}</div>
    {sub && <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{sub}</div>}
  </div>
);

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [planModal, setPlanModal] = useState(null);
  const [banModal, setBanModal]   = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [setup2FA, setSetup2FA] = useState(null);
  const [twoFACode, setTwoFACode] = useState('');

  // Broadcast form
  const [bMsg, setBMsg] = useState('');
  const [bType, setBType] = useState('info');
  const [bPlan, setBPlan] = useState('');

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/dashboard'); return; }
    loadStats();
  }, [user]);

  useEffect(() => { if (tab==='users') loadUsers(); }, [tab, page, search, planFilter]);

  const loadStats = async () => {
    try { const r = await api.get('/admin/stats'); setStats(r.data.stats); }
    catch { toast.error('Erreur chargement stats'); }
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/users', { params:{ page, limit:15, search, plan:planFilter } });
      setUsers(r.data.users); setTotal(r.data.total);
    } catch { toast.error('Erreur chargement utilisateurs'); }
    setLoading(false);
  }, [page, search, planFilter]);

  const setPlan = async (userId, plan) => {
    try {
      await api.patch(`/admin/users/${userId}/plan`, { plan });
      toast.success(`Plan ${plan} attribué !`);
      setPlanModal(null); loadUsers(); loadStats();
    } catch(e) { toast.error(e.response?.data?.error || 'Erreur'); }
  };

  const toggleBan = async (userId, banned, reason='') => {
    try {
      await api.patch(`/admin/users/${userId}/ban`, { banned, reason });
      toast.success(banned ? 'Compte banni' : 'Compte débanni');
      setBanModal(null); loadUsers();
    } catch(e) { toast.error(e.response?.data?.error || 'Erreur'); }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Supprimer définitivement cet utilisateur ?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Utilisateur supprimé');
      loadUsers(); loadStats();
    } catch(e) { toast.error(e.response?.data?.error || 'Erreur'); }
  };

  const sendBroadcast = async () => {
    if (!bMsg.trim()) return;
    try {
      const r = await api.post('/admin/broadcast', { message:bMsg, type:bType, targetPlan:bPlan });
      toast.success(`Message envoyé à ${r.data.sent} utilisateurs`);
      setBroadcastModal(false); setBMsg(''); setBPlan(''); setBType('info');
    } catch(e) { toast.error(e.response?.data?.error || 'Erreur'); }
  };

  const setup2FAFn = async () => {
    try {
      const r = await api.post('/admin/2fa/setup');
      setSetup2FA(r.data);
    } catch(e) { toast.error(e.response?.data?.error || 'Erreur'); }
  };

  const verify2FA = async () => {
    try {
      await api.post('/admin/2fa/verify', { token:twoFACode });
      toast.success('A2F activée avec succès !');
      setSetup2FA(null); setTwoFACode('');
    } catch(e) { toast.error(e.response?.data?.error || 'Code invalide'); }
  };

  const saveNote = async (userId, note) => {
    try {
      await api.patch(`/admin/users/${userId}/note`, { note });
      toast.success('Note sauvegardée');
      setNoteModal(null); loadUsers();
    } catch(e) { toast.error('Erreur'); }
  };

  const TABS = [
    { id:'stats', icon:'fa-chart-bar', label:'Stats' },
    { id:'users', icon:'fa-users', label:'Utilisateurs' },
    { id:'broadcast', icon:'fa-megaphone', label:'Broadcast' },
    { id:'security', icon:'fa-shield-halved', label:'Sécurité' },
  ];

  const inputStyle = { width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'Outfit',sans-serif" }}>

      {/* Top bar */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:58, position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#FF5C5C,#d4380d)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="fa-solid fa-shield-halved" style={{ color:'white', fontSize:13 }} />
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:15 }}>Panel Admin</div>
            <div style={{ fontSize:10, color:C.muted }}>SocialBoost AI · Accès restreint</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <a href="/dashboard" style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:9, border:`1px solid ${C.border}`, color:C.muted, textDecoration:'none', fontSize:12, fontWeight:600 }}>
            <i className="fa-solid fa-arrow-left" style={{ fontSize:10 }} />Dashboard
          </a>
        </div>
      </div>

      <div style={{ display:'flex', minHeight:'calc(100vh - 58px)' }}>
        {/* Sidebar */}
        <aside style={{ width:200, background:C.surface, borderRight:`1px solid ${C.border}`, padding:'16px 10px' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 13px', borderRadius:10, border:`1px solid ${tab===t.id ? C.borderHi : 'transparent'}`, background:tab===t.id ? C.accentLo : 'transparent', color:tab===t.id ? '#c4b5fd' : C.muted, cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'inherit', marginBottom:3, transition:'all .15s', textAlign:'left' }}>
              <i className={`fa-solid ${t.icon}`} style={{ width:16, textAlign:'center', fontSize:13 }} />
              {t.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main style={{ flex:1, padding:24, overflowY:'auto' }}>

          {/* ── STATS ── */}
          {tab==='stats' && (
            <div>
              <h1 style={{ fontSize:22, fontWeight:900, marginBottom:6 }}>Vue d'ensemble</h1>
              <div style={{ fontSize:13, color:C.muted, marginBottom:24 }}>Statistiques en temps réel de la plateforme</div>
              {stats ? (
                <>
                  <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:24 }}>
                    <StatCard icon="fa-users" label="Total inscrits" value={stats.total} color={C.accent} sub="Depuis le lancement" />
                    <StatCard icon="fa-crown" label="Abonnés payants" value={stats.paying} color={C.yellow} sub="Plans actifs" />
                    <StatCard icon="fa-user-plus" label="Cette semaine" value={stats.recent} color={C.green} sub="Nouveaux inscrits" />
                    <StatCard icon="fa-ban" label="Comptes bannis" value={stats.banned} color={C.red} sub="Suspendus" />
                  </div>
                  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
                    <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>
                      <i className="fa-solid fa-chart-pie" style={{ color:C.accent, marginRight:8 }} />Répartition par plan
                    </div>
                    <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                      {stats.byPlan?.map((p,i) => (
                        <div key={i} style={{ padding:'12px 18px', background:`${PLAN_COLOR[p._id]||C.muted}12`, border:`1px solid ${PLAN_COLOR[p._id]||C.muted}30`, borderRadius:12, display:'flex', alignItems:'center', gap:10 }}>
                          <i className={`fa-solid ${PLAN_ICON[p._id]||'fa-user'}`} style={{ color:PLAN_COLOR[p._id]||C.muted, fontSize:14 }} />
                          <div>
                            <div style={{ fontWeight:800, fontSize:18, color:C.text }}>{p.count}</div>
                            <div style={{ fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:'0.5px' }}>{p._id}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign:'center', padding:60, color:C.muted }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize:24, marginBottom:12 }} /><br/>Chargement...
                </div>
              )}
            </div>
          )}

          {/* ── USERS ── */}
          {tab==='users' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
                <div>
                  <h1 style={{ fontSize:22, fontWeight:900, marginBottom:4 }}>Utilisateurs</h1>
                  <div style={{ fontSize:13, color:C.muted }}>{total} comptes au total</div>
                </div>
              </div>
              {/* Filters */}
              <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
                <div style={{ position:'relative', flex:1, minWidth:200 }}>
                  <i className="fa-solid fa-magnifying-glass" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:C.muted, fontSize:12 }} />
                  <input placeholder="Rechercher nom, email..." value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }}
                    style={{ ...inputStyle, paddingLeft:36 }} />
                </div>
                <select value={planFilter} onChange={e=>{ setPlanFilter(e.target.value); setPage(1); }}
                  style={{ ...inputStyle, width:'auto', cursor:'pointer' }}>
                  <option value="">Tous les plans</option>
                  {PLANS.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {/* Table */}
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom:`1px solid ${C.border}`, background:'rgba(255,255,255,0.02)' }}>
                        {['Utilisateur','Plan','Statut','Inscrit le','Actions'].map(h=>(
                          <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'1px', whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={5} style={{ textAlign:'center', padding:40, color:C.muted }}>
                          <i className="fa-solid fa-spinner fa-spin" style={{ marginRight:8 }} />Chargement...
                        </td></tr>
                      ) : users.map(u => (
                        <tr key={u._id} style={{ borderBottom:`1px solid ${C.border}`, transition:'background .15s' }}
                          onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <td style={{ padding:'12px 16px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14, flexShrink:0 }}>
                                {u.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight:600, fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
                                  {u.name}
                                  {u.isAdmin && <span style={{ fontSize:9, padding:'1px 6px', borderRadius:999, background:'rgba(255,92,92,0.15)', color:C.red, fontWeight:700 }}>ADMIN</span>}
                                </div>
                                <div style={{ fontSize:11, color:C.muted }}>{u.email}</div>
                                {u.adminNote && <div style={{ fontSize:10, color:C.yellow, marginTop:2 }}>📝 {u.adminNote}</div>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:'12px 16px' }}><Badge plan={u.subscription?.plan||'free'} /></td>
                          <td style={{ padding:'12px 16px' }}>
                            {u.isBanned ? (
                              <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, color:C.red, fontWeight:700 }}>
                                <i className="fa-solid fa-ban" style={{ fontSize:9 }} />Banni
                              </span>
                            ) : (
                              <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, color:C.green, fontWeight:700 }}>
                                <i className="fa-solid fa-circle-check" style={{ fontSize:9 }} />Actif
                              </span>
                            )}
                          </td>
                          <td style={{ padding:'12px 16px', fontSize:12, color:C.muted, whiteSpace:'nowrap' }}>
                            {new Date(u.createdAt).toLocaleDateString('fr')}
                          </td>
                          <td style={{ padding:'12px 16px' }}>
                            <div style={{ display:'flex', gap:5 }}>
                              {/* Plan */}
                              <button onClick={()=>setPlanModal(u)} title="Modifier le plan"
                                style={{ padding:'6px 10px', borderRadius:7, border:`1px solid ${C.border}`, background:'transparent', color:'#a78bfa', cursor:'pointer', fontSize:11, fontFamily:'inherit' }}>
                                <i className="fa-solid fa-crown" />
                              </button>
                              {/* Note */}
                              <button onClick={()=>setNoteModal({ user:u, note:u.adminNote||'' })} title="Ajouter une note"
                                style={{ padding:'6px 10px', borderRadius:7, border:`1px solid ${C.border}`, background:'transparent', color:C.yellow, cursor:'pointer', fontSize:11, fontFamily:'inherit' }}>
                                <i className="fa-solid fa-note-sticky" />
                              </button>
                              {/* Ban */}
                              <button onClick={()=>setBanModal(u)} title={u.isBanned?'Débannir':'Bannir'}
                                style={{ padding:'6px 10px', borderRadius:7, border:`1px solid ${C.border}`, background:'transparent', color:u.isBanned?C.green:C.orange, cursor:'pointer', fontSize:11, fontFamily:'inherit' }}>
                                <i className={`fa-solid ${u.isBanned?'fa-check':'fa-ban'}`} />
                              </button>
                              {/* Delete */}
                              {!u.isAdmin && (
                                <button onClick={()=>deleteUser(u._id)} title="Supprimer"
                                  style={{ padding:'6px 10px', borderRadius:7, border:'1px solid rgba(255,92,92,0.25)', background:'transparent', color:C.red, cursor:'pointer', fontSize:11, fontFamily:'inherit' }}>
                                  <i className="fa-solid fa-trash" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {total > 15 && (
                  <div style={{ padding:'12px 16px', borderTop:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12, color:C.muted }}>
                    <span>Page {page} · {total} résultats</span>
                    <div style={{ display:'flex', gap:6 }}>
                      {page>1 && <button onClick={()=>setPage(p=>p-1)} style={{ padding:'5px 12px', borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', color:C.text, cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>← Précédent</button>}
                      {page*15<total && <button onClick={()=>setPage(p=>p+1)} style={{ padding:'5px 12px', borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', color:C.text, cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>Suivant →</button>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── BROADCAST ── */}
          {tab==='broadcast' && (
            <div style={{ maxWidth:620 }}>
              <h1 style={{ fontSize:22, fontWeight:900, marginBottom:6 }}>Broadcast</h1>
              <div style={{ fontSize:13, color:C.muted, marginBottom:24 }}>Envoyer un message à tous les utilisateurs ou un plan spécifique</div>
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:8 }}>Message</div>
                  <textarea value={bMsg} onChange={e=>setBMsg(e.target.value)} placeholder="Écris ton message ici..." rows={4}
                    style={{ ...inputStyle, resize:'vertical' }} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:8 }}>Type</div>
                    <select value={bType} onChange={e=>setBType(e.target.value)} style={{ ...inputStyle, cursor:'pointer' }}>
                      <option value="info">ℹ️ Info</option>
                      <option value="success">✅ Succès</option>
                      <option value="warning">⚠️ Avertissement</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:8 }}>Cibler</div>
                    <select value={bPlan} onChange={e=>setBPlan(e.target.value)} style={{ ...inputStyle, cursor:'pointer' }}>
                      <option value="">Tous les utilisateurs</option>
                      {PLANS.map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={sendBroadcast} disabled={!bMsg.trim()} style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 24px', borderRadius:11, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', color:'white', border:'none', fontSize:14, fontWeight:700, cursor:!bMsg.trim()?'not-allowed':'pointer', fontFamily:'inherit', opacity:!bMsg.trim()?0.5:1, boxShadow:'0 4px 16px rgba(124,92,252,0.3)' }}>
                  <i className="fa-solid fa-paper-plane" />Envoyer le broadcast
                </button>
              </div>
            </div>
          )}

          {/* ── SECURITY / A2F ── */}
          {tab==='security' && (
            <div style={{ maxWidth:560 }}>
              <h1 style={{ fontSize:22, fontWeight:900, marginBottom:6 }}>Sécurité du compte admin</h1>
              <div style={{ fontSize:13, color:C.muted, marginBottom:24 }}>Protégez votre compte avec l'authentification à deux facteurs</div>
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24, marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
                  <div style={{ width:48, height:48, borderRadius:13, background:user?.twoFA?.enabled?'rgba(0,214,143,0.1)':'rgba(255,92,92,0.1)', border:`1px solid ${user?.twoFA?.enabled?'rgba(0,214,143,0.3)':'rgba(255,92,92,0.3)'}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <i className={`fa-solid ${user?.twoFA?.enabled?'fa-shield-halved':'fa-shield-halved'}`} style={{ fontSize:20, color:user?.twoFA?.enabled?C.green:C.red }} />
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15 }}>Authentification A2F</div>
                    <div style={{ fontSize:12, color:user?.twoFA?.enabled?C.green:C.red, fontWeight:600 }}>
                      {user?.twoFA?.enabled ? '✅ Activée — Compte protégé' : '⚠️ Non activée — Compte vulnérable'}
                    </div>
                  </div>
                </div>
                {!user?.twoFA?.enabled && !setup2FA && (
                  <button onClick={setup2FAFn} style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 20px', borderRadius:11, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', color:'white', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 14px rgba(124,92,252,0.3)' }}>
                    <i className="fa-solid fa-qrcode" />Configurer Google Authenticator
                  </button>
                )}
                {setup2FA && (
                  <div>
                    <div style={{ padding:16, background:'rgba(124,92,252,0.08)', border:'1px solid rgba(124,92,252,0.2)', borderRadius:12, marginBottom:16, textAlign:'center' }}>
                      <div style={{ fontSize:13, color:'#c4b5fd', marginBottom:12, fontWeight:600 }}>Scanne ce QR code avec Google Authenticator ou Authy</div>
                      <img src={setup2FA.qrUrl} alt="QR Code A2F" style={{ width:200, height:200, borderRadius:12, border:'4px solid white' }} />
                      <div style={{ fontSize:11, color:C.muted, marginTop:10 }}>
                        Code manuel: <code style={{ color:'#a78bfa', fontSize:12 }}>{setup2FA.secret}</code>
                      </div>
                    </div>
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:8 }}>Code de vérification (6 chiffres)</div>
                      <input type="text" value={twoFACode} onChange={e=>setTwoFACode(e.target.value)} placeholder="000000" maxLength={6}
                        style={{ ...inputStyle, textAlign:'center', fontSize:22, fontWeight:700, letterSpacing:8 }} />
                    </div>
                    <button onClick={verify2FA} disabled={twoFACode.length!==6} style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 20px', borderRadius:11, background:'linear-gradient(135deg,#00D68F,#00a36c)', color:'white', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:twoFACode.length!==6?0.5:1 }}>
                      <i className="fa-solid fa-check" />Activer l'A2F
                    </button>
                  </div>
                )}
              </div>
              {/* Instructions */}
              <div style={{ padding:16, background:'rgba(255,184,0,0.06)', border:'1px solid rgba(255,184,0,0.2)', borderRadius:12, fontSize:13, lineHeight:1.7 }}>
                <div style={{ fontWeight:700, color:C.yellow, marginBottom:8 }}><i className="fa-solid fa-triangle-exclamation" style={{ marginRight:6 }} />Instructions sécurité</div>
                <div style={{ color:'#c0c0a0' }}>
                  1. Télécharge <strong>Google Authenticator</strong> ou <strong>Authy</strong><br/>
                  2. Scanne le QR code pour lier ton compte<br/>
                  3. À chaque connexion admin, le code sera demandé<br/>
                  4. Garde ton téléphone sécurisé — c'est la seule façon d'accéder
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MODAL: Modifier plan ── */}
      {planModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:20 }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:28, width:'100%', maxWidth:380 }}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:6 }}>Modifier le plan</div>
            <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>{planModal.name} · {planModal.email}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              {PLANS.map(p => (
                <button key={p} onClick={()=>setPlan(planModal._id, p)} style={{ padding:'14px 12px', borderRadius:12, border:`1px solid ${PLAN_COLOR[p]}44`, background:`${PLAN_COLOR[p]}10`, color:PLAN_COLOR[p], cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'all .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background=`${PLAN_COLOR[p]}22`}
                  onMouseLeave={e=>e.currentTarget.style.background=`${PLAN_COLOR[p]}10`}>
                  <i className={`fa-solid ${PLAN_ICON[p]}`} style={{ fontSize:12 }} />{p.charAt(0).toUpperCase()+p.slice(1)}
                  {(planModal.subscription?.plan===p) && ' ✓'}
                </button>
              ))}
            </div>
            <button onClick={()=>setPlanModal(null)} style={{ width:'100%', padding:'10px', borderRadius:10, border:`1px solid ${C.border}`, background:'transparent', color:C.muted, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>Annuler</button>
          </div>
        </div>
      )}

      {/* ── MODAL: Ban ── */}
      {banModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:20 }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:28, width:'100%', maxWidth:380 }}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:6 }}>{banModal.isBanned ? 'Débannir' : 'Bannir'} l'utilisateur</div>
            <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>{banModal.name} · {banModal.email}</div>
            {!banModal.isBanned && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:8 }}>Raison (optionnel)</div>
                <input id="banReason" placeholder="ex: Spam, comportement abusif..." style={inputStyle} />
              </div>
            )}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>toggleBan(banModal._id, !banModal.isBanned, document.getElementById('banReason')?.value||'')}
                style={{ flex:1, padding:'11px', borderRadius:11, background:banModal.isBanned?'rgba(0,214,143,0.15)':'rgba(255,92,92,0.15)', border:`1px solid ${banModal.isBanned?'rgba(0,214,143,0.3)':'rgba(255,92,92,0.3)'}`, color:banModal.isBanned?C.green:C.red, cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'inherit' }}>
                <i className={`fa-solid ${banModal.isBanned?'fa-check':'fa-ban'}`} style={{ marginRight:6 }} />
                {banModal.isBanned ? 'Débannir' : 'Bannir'}
              </button>
              <button onClick={()=>setBanModal(null)} style={{ flex:1, padding:'11px', borderRadius:11, border:`1px solid ${C.border}`, background:'transparent', color:C.muted, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Note ── */}
      {noteModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:20 }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:28, width:'100%', maxWidth:380 }}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:6 }}>Note admin</div>
            <div style={{ fontSize:13, color:C.muted, marginBottom:16 }}>{noteModal.user.name}</div>
            <textarea value={noteModal.note} onChange={e=>setNoteModal(n=>({...n,note:e.target.value}))} rows={3}
              placeholder="Note interne..." style={{ ...inputStyle, resize:'none', marginBottom:14 }} />
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>saveNote(noteModal.user._id, noteModal.note)} style={{ flex:1, padding:'11px', borderRadius:11, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', color:'white', border:'none', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'inherit' }}>Sauvegarder</button>
              <button onClick={()=>setNoteModal(null)} style={{ flex:1, padding:'11px', borderRadius:11, border:`1px solid ${C.border}`, background:'transparent', color:C.muted, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
