import React from 'react';
import { Container, Title, Text } from '@mantine/core';

function UsersPage() {
  return (
    <Container fluid>
      <Title order={1} mb="lg">
        Usuários
      </Title>
      <Text>
        Página de gerenciamento de usuários em desenvolvimento.
      </Text>
    </Container>
  );
}

export default UsersPage;