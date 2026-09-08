// frontend/src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 max-w-md w-full space-y-6">
        <div className="text-6xl font-black gradient-text-indigo">404</div>
        <div>
          <h1 className="text-xl font-bold text-white">Page Not Found</h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The page or resource you are looking for does not exist or has been moved.
          </p>
        </div>

        <Link
          to="/login"
          className="inline-block py-3 px-6 gradient-bg-primary text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 hover:opacity-95 transition"
        >
          Return to E-Study Portal
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
