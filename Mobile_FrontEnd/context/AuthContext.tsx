import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  user_id: string;
  email: string;
  name: string;
  user_type: 'client' | 'dietitian';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, userType: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string, userType: string) => {
    setLoading(true);
    try {
      // API call to backend
      const response = await fetch('http://10.143.19.78:5000/api/dietitian/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, user_type: userType })
      });

      const data = await response.json();

      // ✅ Backend'den gelen response'a göre kontrol
      if (response.ok && data.token && data.user) {
        const userData = {
          user_id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          user_type: data.user_type
        };
        
        setUser(userData);
        setIsAuthenticated(true);

        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('token', data.token);
        
        return true;
      }
      
      // ✅ Login başarısız
      return false;
      
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
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