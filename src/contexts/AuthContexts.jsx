// import React, { createContext, useState, useContext, useEffect } from 'react';
// import { getToken, setToken, removeToken } from '../utils/auth';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const token = getToken();
//     const storedUser = localStorage.getItem('user');
//     if (token && storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   const login = (token, userInfo) => {
//     setToken(token);
//     const user = { token, ...userInfo };
//     localStorage.setItem('user', JSON.stringify(user));
//     setUser(user);
//   };

//   const logout = () => {
//     removeToken();
//     localStorage.removeItem('user');
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

import React, { createContext, useState, useContext, useEffect } from 'react';
import { getToken, setToken, removeToken } from '../utils/auth';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for token in URL params (for Google OAuth callback)
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get('token');

        if (tokenFromUrl) {
          // If we have a token in the URL (from Google OAuth)
          await login(tokenFromUrl);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          // Check for existing token in localStorage
          const token = getToken();
          const storedUser = localStorage.getItem('user');
          
          if (token && storedUser) {
            // Verify the token is still valid
            try {
              api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              const response = await api.get('/verifyToken');
              
              if (response.data.user) {
                setUser(response.data.user);
              } else {
                // If token verification fails, clear everything
                removeToken();
                localStorage.removeItem('user');
                delete api.defaults.headers.common['Authorization'];
              }
            } catch (error) {
              console.error('Token verification failed:', error);
              removeToken();
              localStorage.removeItem('user');
              delete api.defaults.headers.common['Authorization'];
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (token, userInfo = null) => {
    try {
      setToken(token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      if (!userInfo) {
        // If we don't have userInfo (like in Google OAuth case), fetch it
        const response = await api.get('/verifyToken');
        userInfo = response.data.user;
      }

      const userData = { token, ...userInfo };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      removeToken();
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};