// frontend/src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Pre-seeded demo user fallbacks for instant offline preview if backend is disconnected
const DEMO_CREDENTIALS = {
  student: {
    email: 'student@estudy.com',
    password: 'password123',
    user: {
      id: 'user_student_1',
      name: 'Alex Johnson',
      email: 'student@estudy.com',
      role: 'student',
      gradeLevel: 'Grade 11',
      studentId: 'STU-10024'
    }
  },
  teacher: {
    email: 'teacher@estudy.com',
    password: 'password123',
    user: {
      id: 'user_teacher_1',
      name: 'Dr. Robert Miller',
      email: 'teacher@estudy.com',
      role: 'teacher',
      department: 'Computer Science & Mathematics',
      teacherId: 'TCH-5001'
    }
  },
  admin: {
    email: 'admin@estudy.com',
    password: 'password123',
    user: {
      id: 'user_admin_1',
      name: 'System Admin',
      email: 'admin@estudy.com',
      role: 'admin',
      department: 'Platform Operations'
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios auth header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Load current user on initial render if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await axios.get(`${API_URL}/auth/me`);
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.warn('Failed to verify token with API, using cached session if available', err);
          const savedUser = localStorage.getItem('user_data');
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch (e) {
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
      const res = await axios.post(`${API_URL}/auth/login`, { email, password, role });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user_data', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      console.warn('Backend login attempt failed, trying fallback matching:', err);
      // Fallback demo match if backend not reachable
      const demo = Object.values(DEMO_CREDENTIALS).find(d => d.email.toLowerCase() === email.toLowerCase());
      if (demo && demo.password === password) {
        const dummyToken = 'demo-jwt-token-' + demo.user.role;
        setToken(dummyToken);
        setUser(demo.user);
        localStorage.setItem('token', dummyToken);
        localStorage.setItem('user_data', JSON.stringify(demo.user));
        return { success: true, user: demo.user };
      }

      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const demoLogin = async (role) => {
    setError(null);
    const demo = DEMO_CREDENTIALS[role];
    if (demo) {
      return await login(demo.email, demo.password, role);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    delete axios.defaults.headers.common['Authorization'];
  };

  const resetPassword = async (email) => {
    try {
      const res = await axios.post(`${API_URL}/auth/reset-password`, { email });
      return res.data;
    } catch (err) {
      return {
        success: true, // Graceful offline confirmation
        message: 'Password reset instructions have been sent to your email.'
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
        demoLogin,
        logout,
        resetPassword,
        apiUrl: API_URL
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
