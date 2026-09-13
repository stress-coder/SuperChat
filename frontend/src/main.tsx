import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from '@/store';
import App from '@/App.tsx';
import '@/assets/css/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      {/* Single place backend messages surface — see store/actions/authActions.ts */}
      <Toaster position="top-right" />
    </Provider>
  </StrictMode>,
);
