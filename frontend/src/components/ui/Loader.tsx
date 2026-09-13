import '@/assets/css/loader.css';

interface LoaderProps {
  /** Fills the viewport — used as the route-level fallback while a page loads. */
  fullScreen?: boolean;
}

/**
 * The app's loading indicator. Rendered as the Suspense fallback in App.tsx, so
 * every page shows it before appearing.
 */
const Loader = ({ fullScreen = false }: LoaderProps) => {
  return (
    <div className={`loader${fullScreen ? ' loader--full' : ''}`} role="status" aria-live="polite">
      <span className="loader__spinner" aria-hidden="true" />
      <span className="loader__label">Loading</span>
    </div>
  );
};

export default Loader;
