import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PLAN_COLOR = { free:'#6A6A8E', starter:'#a78bfa', pro:'#8b5cf6', agency:'#FFB800' };
const PLAN_LABEL = { free:'Free', starter:'Starter', pro:'Pro 🔥', agency:'Agency ⭐' };
const PLAN_ICON  = { free:'fa-user', starter:'fa-bolt', pro:'fa-fire', agency:'fa-crown' };

const NAV = [
  { path:'/dashboard/generate', label:'Studio IA',    icon:'fa-wand-magic-sparkles' },
  { path:'/dashboard/billing',  label:'Abonnement',   icon:'fa-crown' },
  { path:'/dashboard/settings', label:'Paramètres',   icon:'fa-gear' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);
  const plan = user?.subscription?.plan || 'free';

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding:'20px 18px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(124,92,252,0.4)', flexShrink:0 }}>
            <i className="fa-solid fa-bolt" style={{ color:'white', fontSize:16 }} />
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:15, letterSpacing:'-0.3px', color:'#EEEEFF' }}>SocialBoost</div>
            <div style={{ fontSize:10, color:'#7C5CFC', fontWeight:700, letterSpacing:'1px' }}>AI STUDIO</div>
          </div>
          <button onClick={()=>setOpen(false)} className="mobile-only" style={{ marginLeft:'auto', background:'none', border:'none', color:'#5a5a8a', cursor:'pointer', fontSize:18, display:'none' }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      </div>

      {/* User */}
      <div style={{ margin:'12px 10px', padding:'12px 13px', background:'rgba(124,92,252,0.08)', border:'1px solid rgba(124,92,252,0.15)', borderRadius:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:800, color:'white', flexShrink:0 }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:13, color:'#EEEEFF', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:1 }}>
              <i className={`fa-solid ${PLAN_ICON[plan]}`} style={{ fontSize:9, color:PLAN_COLOR[plan] }} />
              <span style={{ fontSize:10, fontWeight:800, color:PLAN_COLOR[plan], textTransform:'uppercase', letterSpacing:'0.5px' }}>{PLAN_LABEL[plan]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'6px 8px', overflowY:'auto' }}>
        <div style={{ fontSize:10, fontWeight:700, color:'#2d2d5a', textTransform:'uppercase', letterSpacing:'1.5px', padding:'0 8px', marginBottom:6 }}>Navigation</div>
        {NAV.map(item => (
          <NavLink key={item.path} to={item.path} onClick={()=>setOpen(false)} style={({ isActive }) => ({
            display:'flex', alignItems:'center', gap:11, padding:'11px 13px',
            borderRadius:11, textDecoration:'none', marginBottom:2, fontSize:14,
            fontWeight: isActive ? 700 : 500,
            color: isActive ? '#fff' : '#4a4a7a',
            background: isActive ? 'linear-gradient(135deg,rgba(124,92,252,0.22),rgba(90,64,212,0.12))' : 'transparent',
            border: isActive ? '1px solid rgba(124,92,252,0.28)' : '1px solid transparent',
            transition:'all .15s',
          })}>
            <i className={`fa-solid ${item.icon}`} style={{ width:17, textAlign:'center', fontSize:13 }} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Upgrade */}
      {plan === 'free' && (
        <div style={{ padding:'8px 10px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <NavLink to="/dashboard/billing" onClick={()=>setOpen(false)} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', borderRadius:11, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', color:'white', textDecoration:'none', boxShadow:'0 4px 16px rgba(124,92,252,0.3)' }}>
            <i className="fa-solid fa-arrow-up" style={{ fontSize:12 }} />
            <span style={{ fontWeight:700, fontSize:13 }}>Passer à Starter — 5€/mois</span>
          </NavLink>
        </div>
      )}

      {/* Logout */}
      <div style={{ padding:'8px 10px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={()=>{ logout(); navigate('/'); }} style={{ width:'100%', padding:'10px', borderRadius:10, background:'transparent', border:'1px solid rgba(255,255,255,0.05)', color:'#3d3d6a', cursor:'pointer', fontSize:13, fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .2s' }}
          onMouseEnter={e=>{ e.currentTarget.style.color='#FF5C5C'; e.currentTarget.style.borderColor='rgba(255,92,92,0.25)'; }}
          onMouseLeave={e=>{ e.currentTarget.style.color='#3d3d6a'; e.currentTarget.style.borderColor='rgba(255,255,255,0.05)'; }}>
          <i className="fa-solid fa-right-from-bracket" style={{ fontSize:12 }} />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#07070e', color:'#EEEEFF', fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        @media(max-width:768px){
          .desktop-sidebar{ display:none !important; }
          .main-content{ margin-left:0 !important; }
          .mobile-topbar{ display:flex !important; }
          .mobile-only{ display:block !important; }
        }
        @media(min-width:769px){
          .mobile-topbar{ display:none !important; }
          .mobile-drawer{ display:none !important; }
        }
      `}</style>

      {/* Desktop sidebar */}
      <aside className="desktop-sidebar" style={{ width:230, flexShrink:0, background:'#0a0a16', borderRight:'1px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, height:'100vh', zIndex:50 }}>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="mobile-topbar" style={{ display:'none', position:'fixed', top:0, left:0, right:0, height:56, background:'#0a0a16', borderBottom:'1px solid rgba(255,255,255,0.06)', alignItems:'center', padding:'0 16px', zIndex:50, gap:12 }}>
        <button onClick={()=>setOpen(true)} style={{ background:'none', border:'none', color:'#EEEEFF', cursor:'pointer', fontSize:20, padding:4 }}>
          <i className="fa-solid fa-bars" />
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="fa-solid fa-bolt" style={{ color:'white', fontSize:12 }} />
          </div>
          <span style={{ fontWeight:800, fontSize:14 }}>SocialBoost AI</span>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
          <i className={`fa-solid ${PLAN_ICON[plan]}`} style={{ color:PLAN_COLOR[plan], fontSize:12 }} />
          <span style={{ fontSize:11, fontWeight:700, color:PLAN_COLOR[plan] }}>{PLAN_LABEL[plan]}</span>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {open && <div onClick={()=>setOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:98 }} />}

      {/* Mobile drawer */}
      <aside className="mobile-drawer" style={{ position:'fixed', top:0, left:0, width:260, height:'100vh', background:'#0a0a16', borderRight:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', zIndex:99, transform:open?'translateX(0)':'translateX(-100%)', transition:'transform .25s ease' }}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <main className="main-content" style={{ flex:1, marginLeft:230, overflowY:'auto', minHeight:'100vh', paddingTop:0 }}>
        {/* Mobile padding */}
        <div className="mobile-topbar-spacer" style={{ height:0 }} />
        <style>{`@media(max-width:768px){ .mobile-topbar-spacer{ height:56px !important; } }`}</style>
        <Outlet />
      </main>
    </div>
  );
}
