import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppShell from './shell/AppShell';
import './styles/editor.css';

createRoot(document.getElementById('parche-builder')!).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
);
