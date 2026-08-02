/**
 * CarbonSnap — main.tsx
 * FSD: app layer — entry point
 * ReactDOM bootstrap mounting the App shell.
 */
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
