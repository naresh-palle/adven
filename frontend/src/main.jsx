import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Override global fetch to automatically prefix relative /api paths with VITE_API_URL if configured in production
const originFetch = window.fetch;
window.fetch = function (url, options) {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && typeof url === 'string' && url.startsWith('/api')) {
    // Ensure no double slashes if apiUrl has trailing slash
    const cleanApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    url = `${cleanApiUrl}${url}`;
  }
  return originFetch(url, options);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

