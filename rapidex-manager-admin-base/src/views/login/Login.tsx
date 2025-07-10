import { useState, useEffect } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { LoginView } from './LoginView';
import { LoginMobileView } from './LoginMobileView';
import { useArchbaseTheme } from 'archbase-react';

interface LoginProps {
  onLogin: (username: string, password: string, rememberMe: boolean) => void;
  error?: string;
}

export function Login({ onLogin, error }: LoginProps) {
  const theme = useArchbaseTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  const [credentials, setCredentials] = useState<{ username: string; password: string; rememberMe: boolean }>({
    username: '',
    password: '',
    rememberMe: false
  });
  const [localError, setLocalError] = useState<string | undefined>(error);

  // Atualiza o erro local quando o erro de prop muda
  useEffect(() => {
    setLocalError(error);
  }, [error]);

  // Limpa o erro quando as credenciais mudam
  useEffect(() => {
    setLocalError(undefined);
  }, [credentials]);

  // Atualiza credentials quando o email mudar
  const handleEmailChange = (email: string) => {
    setCredentials(prev => ({ ...prev, username: email }));
  };

  // Atualiza credentials quando a senha mudar
  const handlePasswordChange = (password: string) => {
    setCredentials(prev => ({ ...prev, password }));
  };

  // Atualiza remember me
  const handleRememberMeChange = (rememberMe: boolean) => {
    setCredentials(prev => ({ ...prev, rememberMe }));
  };

  // Handle login
  const handleSubmit = () => {
    if (credentials.username && credentials.password) {
      onLogin(credentials.username, credentials.password, credentials.rememberMe);
    }
  };

  if (isMobile) {
    return (
      <LoginMobileView
        onEmailChange={handleEmailChange}
        onPasswordChange={handlePasswordChange}
        onRememberMeChange={handleRememberMeChange}
        onLogin={handleSubmit}
        error={localError}
        email={credentials.username}
        password={credentials.password}
        rememberMe={credentials.rememberMe}
      />
    );
  }

  return (
    <LoginView
      onEmailChange={handleEmailChange}
      onPasswordChange={handlePasswordChange}
      onRememberMeChange={handleRememberMeChange}
      onLogin={handleSubmit}
      error={localError}
      email={credentials.username}
      password={credentials.password}
      rememberMe={credentials.rememberMe}
    />
  );
}