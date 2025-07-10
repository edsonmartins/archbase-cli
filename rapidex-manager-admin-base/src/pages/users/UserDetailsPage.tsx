import React from 'react';
import { Container, Title, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';

function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <Container fluid>
      <Title order={1} mb="lg">
        Detalhes do Usuário
      </Title>
      <Text>
        Exibindo detalhes do usuário com ID: {id}
      </Text>
    </Container>
  );
}

export default UserDetailsPage;