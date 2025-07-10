import React from 'react';
import { Container, Paper, Title, Text } from '@mantine/core';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const { login, error } = useAuth();

  const handleLogin = (username: string, password: string) => {
    login(username, password, false);
  };

  return (
    <Container size="sm" style={{ paddingTop: '10vh' }}>
      <Paper shadow="md" p="xl" radius="md">
        <Title order={2} ta="center" mb="md">
          Login
        </Title>
        
        <Text ta="center" c="dimmed" size="sm">
          Digite suas credenciais para acessar o sistema
        </Text>
        
        {error && (
          <Text color="red" size="sm" mt="sm">
            {error}
          </Text>
        )}
        
        {/* Add your login form here */}
      </Paper>
    </Container>
  );
}

export default LoginPage;