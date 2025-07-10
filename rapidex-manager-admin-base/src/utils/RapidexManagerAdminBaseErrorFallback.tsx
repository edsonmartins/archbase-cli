import { Button, Container, Stack, Title, Text, Code, Paper } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { FallbackProps } from 'react-error-boundary';

export function RapidexManagerAdminBaseErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Container size="md" py="xl" className="min-h-screen flex items-center">
      <Paper shadow="md" p="xl" radius="md" withBorder w="100%">
        <Stack align="center" gap="md">
          <Title order={1} c="red">
            Oops! Algo deu errado
          </Title>
          
          <Text ta="center" c="dimmed">
            Ocorreu um erro inesperado na aplicação. Por favor, tente novamente ou entre em contato com o suporte.
          </Text>
          
          <Code block p="md" className="w-full overflow-auto">
            {error.message}
          </Code>
          
          <Button 
            leftSection={<IconRefresh size={16} />}
            onClick={resetErrorBoundary}
            size="lg"
          >
            Tentar Novamente
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}