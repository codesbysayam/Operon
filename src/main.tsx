import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against benign sandboxed websocket/HMR rejections in container iframe previews
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || event.reason?.toString() || '';
    if (
      reason.includes('WebSocket') ||
      reason.includes('websocket') ||
      reason.includes('vite')
    ) {
      event.preventDefault();
    }
  });
}

const root = document.getElementById('root');

if (!root) {
  throw new Error('OPERON root element was not found.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

