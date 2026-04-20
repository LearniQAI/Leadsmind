'use client';

import React, { createContext, useContext } from 'react';

interface AuthContextType {
  user: any;
  workspace: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ 
  children, 
  user, 
  workspace 
}: { 
  children: React.ReactNode;
  user: any;
  workspace: any;
}) {
  return (
    <AuthContext.Provider value={{ user, workspace }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
