import React from 'react';
import { Container, Title, Text, Button, Center, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container size="md">
      <Center style={{ minHeight: '70vh' }}>
        <Stack align="center" gap="lg">
          <Title order={1} size="3rem" c="dimmed">
            404
          </Title>
          <Title order={2}>
            Página não encontrada
          </Title>
          <Text ta="center" c="dimmed">
            A página que você está procurando não existe ou foi movida.
          </Text>
          <Button onClick={() => navigate('/')}>
            Voltar ao Dashboard
          </Button>
        </Stack>
      </Center>
    </Container>
  );
}

export default NotFoundPage;