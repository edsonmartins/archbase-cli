import React from 'react';
import { Container, Title, Text } from '@mantine/core';

function SettingsPage() {
  return (
    <Container fluid>
      <Title order={1} mb="lg">
        Configurações
      </Title>
      <Text>
        Página de configurações do sistema em desenvolvimento.
      </Text>
    </Container>
  );
}

export default SettingsPage;