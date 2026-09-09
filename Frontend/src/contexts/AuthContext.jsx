// frontend/src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, login as loginRequest, requestPasswordReset } from '../services/authService';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load current user on initial render if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await getMe();
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.warn('Failed to verify token with API, using cached session if available', err);
          const savedUser = localStorage.getItem('user_data');
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch {
              logout();
            }
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password, role) => {
    setError(null);
    try {
      const res = await loginRequest({ email, password, role });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user_data', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
  };

  const resetPassword = async (email) => {
    try {
      const res = await requestPasswordReset(email);
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Unable to request password reset. Please try again.';
      return {
        success: false,
        message: errMsg
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        resetPassword,
        apiUrl: API_URL
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
export default AuthContext;
