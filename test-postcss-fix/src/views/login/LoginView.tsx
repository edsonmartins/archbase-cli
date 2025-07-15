import {
  Button,
  Container,
  Paper,
  PasswordInput,
  TextInput,
  Title,
  Text,
  Checkbox,
  Anchor,
  Stack,
  Alert
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import i18next from 'i18next';

interface LoginViewProps {
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onRememberMeChange: (rememberMe: boolean) => void;
  onLogin: () => void;
  error?: string;
  email: string;
  password: string;
  rememberMe: boolean;
}

export function LoginView({
  onEmailChange,
  onPasswordChange, 
  onRememberMeChange,
  onLogin,
  error,
  email,
  password,
  rememberMe
}: LoginViewProps) {
  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        {i18next.t('test-postcss-fix:Seja Bem-vindo')}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        {i18next.t('test-postcss-fix:getStarted')}
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
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
          />
          
          <PasswordInput
            label={i18next.t('test-postcss-fix:Sua senha')}
            placeholder="Sua senha"
            required
            value={password}
            onChange={(event) => onPasswordChange(event.currentTarget.value)}
          />
          
          <Checkbox
            label={i18next.t('test-postcss-fix:Lembre-me')}
            checked={rememberMe}
            onChange={(event) => onRememberMeChange(event.currentTarget.checked)}
          />
          
          <Button 
            fullWidth 
            mt="xl"
            onClick={onLogin}
            disabled={!email || !password}
          >
            {i18next.t('test-postcss-fix:signIn')}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}