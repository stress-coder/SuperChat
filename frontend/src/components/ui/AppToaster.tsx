import { Toaster } from 'react-hot-toast';
import '@/assets/css/toast.css';

/**
 * The app's single toaster outlet — mounted once in main.tsx.
 * Fire messages with `showToast` from '@/utils/toast', never by importing
 * react-hot-toast elsewhere.
 */
const AppToaster = () => {
  return <Toaster position="top-right" gutter={10} toastOptions={{ className: 'toast' }} />;
};

export default AppToaster;
