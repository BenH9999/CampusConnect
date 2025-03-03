// context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

type AuthContextType = {
  user: any;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  const login = async (username: string, password: string) => {
    setUser({ username });
  };

  const register = async (username: string, email: string, password: string) => {
    setUser({ username, email });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if(!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
