import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// Register PWA service worker for offline caching and desktop app installability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('PWA service worker registration note:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
