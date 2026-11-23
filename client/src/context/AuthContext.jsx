import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('quizarena_token') || null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Guest player profile
  const [guestPlayer, setGuestPlayer] = useState(() => {
    try {
      const saved = localStorage.getItem('quizarena_guest');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      }
    } catch (e) {}
    const randId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return {
      playerId: randId,
      name: `Guest_${randId.substring(6, 10)}`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${randId}`
    };
  });

  // Set default auth header on Axios
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('quizarena_token');
    } catch (e) {}
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully.');
  }, []);

  // Load user profile on mount if token exists
  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/auth/me');
        if (isMounted && res.data && res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.warn('Session expired or invalid token');
        if (isMounted) {
          setUser(null);
          setToken(null);
          try {
            localStorage.removeItem('quizarena_token');
          } catch (e) {}
          delete axios.defaults.headers.common['Authorization'];
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        const { token: newToken, user: userData } = res.data;
        setToken(newToken);
        setUser(userData);
        try {
          localStorage.setItem('quizarena_token', newToken);
        } catch (e) {}
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        toast.success(`Welcome back, ${userData.name}!`);
        return { success: true, user: userData };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        try {
          localStorage.setItem('quizarena_token', newToken);
        } catch (e) {}
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        toast.success(`Account created! Welcome to QuizArena, ${newUser.name}!`);
        return { success: true, user: newUser };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const updateProfile = async (updateData) => {
    try {
      const res = await axios.put('/api/auth/profile', updateData);
      if (res.data.success) {
        setUser(res.data.user);
        toast.success('Profile updated successfully!');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const updateGuest = (name, avatar) => {
    const updated = {
      ...guestPlayer,
      name: name || guestPlayer.name,
      avatar: avatar || guestPlayer.avatar
    };
    setGuestPlayer(updated);
    try {
      localStorage.setItem('quizarena_guest', JSON.stringify(updated));
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isTeacher: user?.role === 'teacher' || user?.role === 'admin',
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        login,
        register,
        logout,
        updateProfile,
        guestPlayer,
        updateGuest
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
