import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ApiError } from './services/api';
import App from './App';
import './index.css';

const client = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: (n, e) => !(e instanceof ApiError && e.status >= 400 && e.status < 500) && n < 2 } } });
createRoot(document.getElementById('root')!).render(
  <StrictMode><QueryClientProvider client={client}><BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter></QueryClientProvider></StrictMode>,
);
