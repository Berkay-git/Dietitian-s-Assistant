import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (email: string, password: string, userType?: 'dietitian' | 'client') => Promise<boolean>;
  logout: () => void;
  userEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const login = async (email: string, password: string, userType?: 'dietitian' | 'client'): Promise<boolean> => {
    try {
      // Backend'e istek gönder
      const response = await fetch("http://192.168.110.70:5000/api/dietitian/auth", {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        email, 
        password,
        user_type: userType // 'dietitian', 'client', 'None'
      }),
    });

    const data = await response.json();

      // Giriş başarılıysa durumu güncelle ve sayfaya yönlendirmeye izin ver
      if (response.ok) { 
        setIsLoggedIn(true);
        setUserEmail(email);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserEmail(null);  // Kullanıcı çıkış yaptığında email bilgisini temizle (RememberMe inaktif)
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, userEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}