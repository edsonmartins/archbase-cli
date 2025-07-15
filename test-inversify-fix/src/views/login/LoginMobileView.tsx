import {
  Button,
  Container,
  Paper,
  PasswordInput,
  TextInput,
  Title,
  Text,
  Checkbox,
  Stack,
  Alert,
  Box
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import i18next from 'i18next';

interface LoginMobileViewProps {
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onRememberMeChange: (rememberMe: boolean) => void;
  onLogin: () => void;
  error?: string;
  email: string;
  password: string;
  rememberMe: boolean;
}

export function LoginMobileView({
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onLogin,
  error,
  email,
  password,
  rememberMe
}: LoginMobileViewProps) {
  return (
    <Box style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container size="xs" px="md">
        <Title ta="center" fw={900} size="xl">
          {i18next.t('test-inversify-fix:Seja Bem-vindo')}
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          {i18next.t('test-inversify-fix:getStarted')}
        </Text>

        <Paper withBorder shadow="md" p={20} mt={30} radius="md">
          <Stack>
            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red">
                {error}
              </Alert>
            )}
            
            <TextInput
              label="Email"
              placeholder="seu@email.com"
              required
              value={email}
              onChange={(event) => onEmailChange(event.currentTarget.value)}
              size="md"
            />
            
            <PasswordInput
              label={i18next.t('test-inversify-fix:Sua senha')}
              placeholder="Sua senha"
              required
              value={password}
              onChange={(event) => onPasswordChange(event.currentTarget.value)}
              size="md"
            />
            
            <Checkbox
              label={i18next.t('test-inversify-fix:Lembre-me')}
              checked={rememberMe}
              onChange={(event) => onRememberMeChange(event.currentTarget.checked)}
            />
            
            <Button 
              fullWidth 
              mt="xl"
              onClick={onLogin}
              disabled={!email || !password}
              size="md"
            >
              {i18next.t('test-inversify-fix:signIn')}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}