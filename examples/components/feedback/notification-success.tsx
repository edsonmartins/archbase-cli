import React from 'react';
import {
  ArchbaseNotifications,
  useArchbaseRemoteDataSource
} from '@archbase/react';
import { Button, Group, Stack, TextInput } from '@mantine/core';
import { 
  IconCheck, 
  IconX, 
  IconAlertTriangle, 
  IconInfoCircle,
  IconSend
} from '@tabler/icons-react';

interface UserDto {
  id?: string;
  name: string;
  email: string;
}

export function NotificationSuccessExample() {
  const dataSource = useArchbaseRemoteDataSource<UserDto, string>({
    name: 'users',
    endPointUrl: '/api/users',
    inserting: true
  });

  const showSuccessNotification = () => {
    ArchbaseNotifications.show({
      id: 'success-save',
      title: 'Usuário salvo!',
      message: 'Os dados foram salvos com sucesso.',
      color: 'green',
      icon: <IconCheck size={18} />,
      autoClose: 4000
    });
  };

  const showErrorNotification = () => {
    ArchbaseNotifications.show({
      id: 'error-save',
      title: 'Erro ao salvar',
      message: 'Ocorreu um erro inesperado. Tente novamente.',
      color: 'red',
      icon: <IconX size={18} />,
      autoClose: 6000
    });
  };

  const showWarningNotification = () => {
    ArchbaseNotifications.show({
      id: 'warning-validation',
      title: 'Atenção',
      message: 'Alguns campos não foram preenchidos corretamente.',
      color: 'orange',
      icon: <IconAlertTriangle size={18} />,
      autoClose: 5000
    });
  };

  const showInfoNotification = () => {
    ArchbaseNotifications.show({
      id: 'info-tip',
      title: 'Dica',
      message: 'Use Ctrl+S para salvar rapidamente.',
      color: 'blue',
      icon: <IconInfoCircle size={18} />,
      autoClose: 3000
    });
  };

  const showLoadingNotification = () => {
    ArchbaseNotifications.show({
      id: 'loading-save',
      title: 'Salvando...',
      message: 'Aguarde enquanto os dados são processados.',
      color: 'blue',
      loading: true,
      autoClose: false
    });

    // Simulate async operation
    setTimeout(() => {
      ArchbaseNotifications.update({
        id: 'loading-save',
        title: 'Concluído!',
        message: 'Dados salvos com sucesso.',
        color: 'green',
        icon: <IconCheck size={18} />,
        loading: false,
        autoClose: 3000
      });
    }, 3000);
  };

  const handleSaveWithFeedback = async () => {
    try {
      // Show loading notification
      ArchbaseNotifications.show({
        id: 'save-process',
        title: 'Salvando usuário...',
        message: 'Aguarde, estamos processando os dados.',
        loading: true,
        autoClose: false
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate validation
      const user = dataSource.getCurrentRecord();
      if (!user?.name || !user?.email) {
        ArchbaseNotifications.update({
          id: 'save-process',
          title: 'Dados incompletos',
          message: 'Preencha todos os campos obrigatórios.',
          color: 'orange',
          icon: <IconAlertTriangle size={18} />,
          loading: false,
          autoClose: 5000
        });
        return;
      }

      // Success
      await dataSource.save();
      ArchbaseNotifications.update({
        id: 'save-process',
        title: 'Usuário salvo!',
        message: `${user.name} foi cadastrado com sucesso.`,
        color: 'green',
        icon: <IconCheck size={18} />,
        loading: false,
        autoClose: 4000
      });

    } catch (error) {
      ArchbaseNotifications.update({
        id: 'save-process',
        title: 'Erro ao salvar',
        message: 'Ocorreu um erro inesperado. Tente novamente.',
        color: 'red',
        icon: <IconX size={18} />,
        loading: false,
        autoClose: 6000
      });
    }
  };

  const showActionNotification = () => {
    ArchbaseNotifications.show({
      id: 'action-required',
      title: 'Confirmação necessária',
      message: 'Clique no botão para confirmar a ação.',
      color: 'yellow',
      icon: <IconAlertTriangle size={18} />,
      autoClose: false,
      withCloseButton: true,
      actions: [
        {
          label: 'Confirmar',
          color: 'blue',
          onClick: () => {
            ArchbaseNotifications.hide('action-required');
            showSuccessNotification();
          }
        },
        {
          label: 'Cancelar',
          color: 'gray',
          variant: 'subtle',
          onClick: () => ArchbaseNotifications.hide('action-required')
        }
      ]
    });
  };

  return (
    <Stack spacing="md">
      {/* Notifications Provider */}
      <ArchbaseNotifications 
        position="top-right"
        limit={5}
        autoClose={4000}
      />

      <h2>Sistema de Notificações</h2>

      {/* Form Example */}
      <Stack spacing="sm">
        <TextInput
          label="Nome"
          placeholder="Digite o nome"
          dataSource={dataSource}
          dataField="name"
        />
        <TextInput
          label="Email"
          placeholder="Digite o email"
          dataSource={dataSource}
          dataField="email"
          type="email"
        />
      </Stack>

      {/* Notification Buttons */}
      <Group>
        <Button 
          color="green" 
          onClick={showSuccessNotification}
          leftIcon={<IconCheck size={16} />}
        >
          Sucesso
        </Button>
        
        <Button 
          color="red" 
          onClick={showErrorNotification}
          leftIcon={<IconX size={16} />}
        >
          Erro
        </Button>
        
        <Button 
          color="orange" 
          onClick={showWarningNotification}
          leftIcon={<IconAlertTriangle size={16} />}
        >
          Aviso
        </Button>
        
        <Button 
          color="blue" 
          onClick={showInfoNotification}
          leftIcon={<IconInfoCircle size={16} />}
        >
          Info
        </Button>
      </Group>

      <Group>
        <Button 
          variant="outline"
          onClick={showLoadingNotification}
        >
          Loading com Update
        </Button>
        
        <Button 
          variant="outline"
          onClick={showActionNotification}
        >
          Com Ações
        </Button>
        
        <Button 
          onClick={handleSaveWithFeedback}
          leftIcon={<IconSend size={16} />}
        >
          Salvar com Feedback
        </Button>
      </Group>

      {/* Utility Buttons */}
      <Group>
        <Button 
          variant="subtle" 
          color="gray"
          onClick={() => ArchbaseNotifications.clean()}
        >
          Limpar Todas
        </Button>
        
        <Button 
          variant="subtle" 
          color="gray"
          onClick={() => ArchbaseNotifications.hide('save-process')}
        >
          Fechar Loading
        </Button>
      </Group>
    </Stack>
  );
}

// Custom notification positions example
export function NotificationPositionsExample() {
  const positions = [
    'top-left',
    'top-right', 
    'bottom-left',
    'bottom-right'
  ] as const;

  const showNotificationAt = (position: typeof positions[number]) => {
    ArchbaseNotifications.show({
      title: `Posição: ${position}`,
      message: `Notificação exibida em ${position}`,
      color: 'blue',
      position,
      autoClose: 3000
    });
  };

  return (
    <Stack spacing="md">
      <h3>Posições das Notificações</h3>
      
      <Group>
        {positions.map(position => (
          <Button 
            key={position}
            variant="outline"
            onClick={() => showNotificationAt(position)}
          >
            {position}
          </Button>
        ))}
      </Group>
    </Stack>
  );
}

// Notification manager utility
export class NotificationManager {
  static showSaveSuccess(entityName: string) {
    ArchbaseNotifications.show({
      title: 'Salvo com sucesso!',
      message: `${entityName} foi salvo com sucesso.`,
      color: 'green',
      icon: <IconCheck size={18} />,
      autoClose: 3000
    });
  }

  static showDeleteSuccess(entityName: string) {
    ArchbaseNotifications.show({
      title: 'Excluído com sucesso!',
      message: `${entityName} foi excluído com sucesso.`,
      color: 'green',
      icon: <IconCheck size={18} />,
      autoClose: 3000
    });
  }

  static showValidationError(message: string) {
    ArchbaseNotifications.show({
      title: 'Erro de validação',
      message,
      color: 'orange',
      icon: <IconAlertTriangle size={18} />,
      autoClose: 5000
    });
  }

  static showServerError() {
    ArchbaseNotifications.show({
      title: 'Erro do servidor',
      message: 'Ocorreu um erro interno. Tente novamente mais tarde.',
      color: 'red',
      icon: <IconX size={18} />,
      autoClose: 6000
    });
  }

  static showNetworkError() {
    ArchbaseNotifications.show({
      title: 'Erro de conexão',
      message: 'Verifique sua conexão com a internet.',
      color: 'red',
      icon: <IconX size={18} />,
      autoClose: 8000
    });
  }
}