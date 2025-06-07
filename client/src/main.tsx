import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from '@/providers/AppProviders';
import App from '@/app/App';

// Import global styles
import '@mysten/dapp-kit/dist/index.css';
import '@radix-ui/themes/styles.css';
import '@/styles/design-system.css';
import '@/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
