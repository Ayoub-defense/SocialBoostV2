import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#16161f',
            color: '#f1f5f9',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#8b5cf6', secondary: 'white' } }
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);
