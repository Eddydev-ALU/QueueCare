import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qc_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('qc_token'));

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('qc_user', JSON.stringify(userData));
    localStorage.setItem('qc_token', tokenData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('qc_user');
    localStorage.removeItem('qc_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
