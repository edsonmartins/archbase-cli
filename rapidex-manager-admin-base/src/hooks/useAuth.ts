import { useArchbaseAuthenticationManager } from 'archbase-react';

export function useAuth() {
  const { 
    login, 
    logout, 
    username, 
    isAuthenticated, 
    error, 
    accessToken 
  } = useArchbaseAuthenticationManager({});

  return {
    user: { name: username },
    login,
    logout,
    isAuthenticated,
    error,
    accessToken
  };
}