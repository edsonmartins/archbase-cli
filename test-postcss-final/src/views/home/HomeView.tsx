import { Container, Title, Text, Card, Group, Stack } from '@mantine/core'
import { IconHome } from '@tabler/icons-react'
import i18next from 'i18next'

export function HomeView() {
  return (
    <Container size="lg" py="xl">
      <Group mb="xl">
        <IconHome size={32} />
        <Title order={1}>{i18next.t('test-postcss-final:Home')}</Title>
      </Group>
      
      <Stack gap="md">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={2} mb="md">
            {i18next.t('test-postcss-final:Bem-vindo ao Test-postcss-final')}
          </Title>
          <Text c="dimmed">
            {i18next.t('test-postcss-final:Esta é sua página inicial')}
          </Text>
        </Card>
        
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">
            Primeiros Passos
          </Title>
          <Text>
            • Explore o dashboard para ver métricas e estatísticas
          </Text>
          <Text>
            • Acesse as configurações para personalizar o sistema
          </Text>
          <Text>
            • Gerencie usuários e permissões na seção de segurança
          </Text>
        </Card>
      </Stack>
    </Container>
  )
}