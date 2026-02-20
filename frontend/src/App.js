import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContentGenerator from './pages/ContentGenerator';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import AdminPanel from './pages/AdminPanel';
import AppLayout from './components/dashboard/AppLayout';

const Loader = () => (
  <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh', background:'#05050f', gap:14, fontFamily:"'Outfit',sans-serif" }}>
    <div style={{ width:44, height:44, borderRadius:13, background:'linear-gradient(135deg,#7C5CFC,#5a40d4)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 20px rgba(124,92,252,0.4)' }}>
      <i className="fa-solid fa-bolt" style={{ color:'white', fontSize:18 }} />
    </div>
    <div style={{ color:'#7C5CFC', fontSize:13, fontWeight:600 }}>Chargement...</div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/"        element={<LandingPage />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login"   element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index           element={<Navigate to="/dashboard/generate" replace />} />
        <Route path="generate" element={<ContentGenerator />} />
        <Route path="settings" element={<Settings />} />
        <Route path="billing"  element={<Pricing inApp />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
