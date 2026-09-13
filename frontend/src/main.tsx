import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@/store';
import AppToaster from '@/components/ui/AppToaster';
import App from '@/App.tsx';
import '@/assets/css/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      {/* Single toaster outlet — fire messages via showToast in '@/utils/toast' */}
      <AppToaster />
    </Provider>
  </StrictMode>,
);
