// frontend/src/components/common/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium animate-pulse">Loading E-Study Corner...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Super Admin has universal authorization across all portals
  if (user.role === 'superadmin') {
    return children ? children : <Outlet />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect user to their own portal dashboard if logged in under another role
    const roleRedirects = {
      student: '/student',
      teacher: '/teacher',
      admin: '/admin',
      superadmin: '/admin'
    };
    return <Navigate to={roleRedirects[user.role] || '/login'} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;

