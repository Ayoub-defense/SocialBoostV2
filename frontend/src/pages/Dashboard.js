import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const StatCard = ({ label, value, icon, trend, color = '#8b5cf6' }) => (
  <div className="card" style={{ position:'relative', overflow:'hidden' }}>
    <div style={{ 
      position:'absolute', top:-20, right:-20, width:80, height:80,
      background: `radial-gradient(circle, ${color}20, transparent)`,
      borderRadius:'50%'
    }} />
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
      <div>
        <div style={{ fontSize:13, color:'#94a3b8', fontWeight:600, marginBottom:8 }}>{label}</div>
        <div style={{ fontSize:32, fontWeight:800 }}>{value}</div>
        {trend && <div style={{ fontSize:12, color:'#34d399', marginTop:4 }}>↑ {trend}</div>}
      </div>
      <div style={{ fontSize:32 }}>{icon}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [upcomingPosts, setUpcomingPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/analytics/timeline?days=14'),
      api.get('/scheduler/upcoming')
    ]).then(([statsRes, timelineRes, upcomingRes]) => {
      setStats(statsRes.data);
      setTimeline(timelineRes.data.timeline || []);
      setUpcomingPosts(upcomingRes.data.posts || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'50vh' }}>
      <div className="spinner" />
    </div>
  );

  const limits = { free: 5, starter: 30, pro: 100, agency: 500 };
  const planLimit = limits[user?.subscription?.plan] || 5;
  const usagePercent = Math.min(((stats?.usage?.postsGenerated || 0) / planLimit) * 100, 100);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:28, fontWeight:800 }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color:'#94a3b8', marginTop:4 }}>
          Voici un aperçu de vos performances aujourd'hui
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid-4" style={{ marginBottom:32 }}>
        <StatCard label="Posts générés" value={stats?.stats?.totalPosts || 0} icon="✍️" />
        <StatCard label="Posts planifiés" value={stats?.stats?.scheduledPosts || 0} icon="📅" color="#6366f1" />
        <StatCard label="Total likes" value={(stats?.stats?.totalLikes || 0).toLocaleString()} icon="❤️" color="#ec4899" />
        <StatCard label="Taux engagement" value={`${stats?.stats?.avgEngagement || 0}%`} icon="📈" color="#10b981" />
      </div>

      <div className="grid-2" style={{ marginBottom:32 }}>
        {/* Chart */}
        <div className="card">
          <h3 style={{ marginBottom:20, fontSize:16 }}>📊 Activité 14 derniers jours</h3>
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill:'#94a3b8', fontSize:11 }} tickFormatter={v => v?.slice(5)} />
                <YAxis tick={{ fill:'#94a3b8', fontSize:11 }} />
                <Tooltip contentStyle={{ background:'#16161f', border:'1px solid rgba(139,92,246,0.3)', borderRadius:8 }} />
                <Area type="monotone" dataKey="posts" stroke="#8b5cf6" fill="url(#gradPurple)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', color:'#475569' }}>
              Publiez vos premiers posts pour voir vos stats ici
            </div>
          )}
        </div>

        {/* Usage */}
        <div className="card">
          <h3 style={{ marginBottom:20, fontSize:16 }}>⚡ Usage mensuel</h3>
          <div style={{ marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ color:'#94a3b8', fontSize:13 }}>Posts générés</span>
              <span style={{ fontWeight:700 }}>{stats?.usage?.postsGenerated || 0} / {planLimit}</span>
            </div>
            <div style={{ height:8, background:'rgba(255,255,255,0.1)', borderRadius:4, overflow:'hidden' }}>
              <div style={{
                height:'100%', width:`${usagePercent}%`,
                background:'linear-gradient(90deg, #8b5cf6, #6d28d9)',
                borderRadius:4, transition:'width 0.3s ease'
              }} />
            </div>
          </div>
          
          <div style={{ padding:16, background:'rgba(139,92,246,0.1)', borderRadius:12, border:'1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ fontSize:13, color:'#94a3b8', marginBottom:4 }}>Plan actuel</div>
            <div style={{ fontSize:20, fontWeight:800, textTransform:'capitalize', color:'#a78bfa' }}>
              {user?.subscription?.plan || 'free'}
            </div>
            {user?.subscription?.plan === 'free' && (
              <Link to="/dashboard/billing" className="btn btn-primary btn-sm" style={{ marginTop:12, display:'inline-flex' }}>
                ⬆️ Upgrader dès 5€/mois
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card" style={{ marginBottom:32 }}>
        <h3 style={{ marginBottom:20, fontSize:16 }}>🚀 Actions rapides</h3>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <Link to="/dashboard/generate" className="btn btn-primary">✨ Générer un post</Link>
          <Link to="/dashboard/scheduler" className="btn btn-secondary">📅 Planifier</Link>
          <Link to="/dashboard/analytics" className="btn btn-secondary">📊 Voir les stats</Link>
          <Link to="/dashboard/messages" className="btn btn-secondary">💬 Messages IA</Link>
        </div>
      </div>

      {/* Upcoming posts */}
      {upcomingPosts.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom:20, fontSize:16 }}>📅 Prochains posts planifiés</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {upcomingPosts.slice(0, 5).map(post => (
              <div key={post._id} style={{
                display:'flex', alignItems:'center', gap:16,
                padding:'12px 16px', background:'rgba(255,255,255,0.03)', borderRadius:10
              }}>
                <div style={{ fontSize:20 }}>{post.platform === 'instagram' ? '📸' : '🎵'}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {post.caption?.slice(0, 60)}...
                  </div>
                  <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>
                    {new Date(post.scheduledAt).toLocaleString('fr-FR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </div>
                </div>
                <span className="badge badge-purple">{post.platform}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
