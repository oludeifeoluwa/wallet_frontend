import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DashboardRole, DashboardUser } from '../types/auth';
import { authApi } from '../api/authApi';
import { getDashboardToken, setDashboardToken } from '../api/client';

interface AuthContextType {
  user: DashboardUser | null;
  role: DashboardRole | null;
  token: string | null;
  loading: boolean;
  login: (role: DashboardRole, token: string, user: Partial<DashboardUser>) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DashboardUser | null>(() => {
    const saved = sessionStorage.getItem('cp_dash_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState<DashboardRole | null>(() => {
    return (sessionStorage.getItem('cp_dash_role') as DashboardRole) || null;
  });

  const [token, setTokenState] = useState<string | null>(getDashboardToken);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    const currentToken = getDashboardToken();
    const currentRole = (sessionStorage.getItem('cp_dash_role') as DashboardRole) || role;
    if (!currentToken || !currentRole) {
      setLoading(false);
      return;
    }

    try {
      if (currentRole === 'Admin') {
        const profile = await authApi.getAdminProfile();
        setUser(profile);
        sessionStorage.setItem('cp_dash_user', JSON.stringify(profile));
      } else if (currentRole === 'SchoolAdmin') {
        const profile = await authApi.getSchoolAdminProfile();
        setUser(profile);
        sessionStorage.setItem('cp_dash_user', JSON.stringify(profile));
      }
    } catch (err: any) {
      // If 401, token is invalid or expired
      if (err?.status === 401) {
        setUser(null);
        setRole(null);
        setDashboardToken(null);
        sessionStorage.removeItem('cp_dash_user');
        sessionStorage.removeItem('cp_dash_role');
      }
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = (newRole: DashboardRole, newToken: string, userData: Partial<DashboardUser>) => {
    setDashboardToken(newToken);
    setTokenState(newToken);
    setRole(newRole);
    sessionStorage.setItem('cp_dash_role', newRole);

    const fullUser: DashboardUser = {
      email: userData.email || '',
      firstname: userData.firstname || (newRole === 'Admin' ? 'Platform' : 'School'),
      lastname: userData.lastname || 'Administrator',
      role: newRole,
      schoolCode: userData.schoolCode,
      schoolName: userData.schoolName,
      walletNumber: userData.walletNumber,
      userId: userData.userId,
      id: userData.id,
    };

    setUser(fullUser);
    sessionStorage.setItem('cp_dash_user', JSON.stringify(fullUser));
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setTokenState(null);
      setUser(null);
      setRole(null);
      setDashboardToken(null);
      sessionStorage.removeItem('cp_dash_user');
      sessionStorage.removeItem('cp_dash_role');
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, token, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useDashboardAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useDashboardAuth must be used within an AuthProvider');
  }
  return context;
}
