import React, { useCallback } from 'react';
import * as yup from 'yup';
import { 
  ArchbaseFormTemplate,
  ArchbaseEdit,
  ArchbaseSelect,
  ArchbaseSelectItem,
  ArchbaseCheckbox,
  ArchbaseNumberEdit,
  ArchbasePasswordEdit,
  ArchbaseTextArea,
  useArchbaseRemoteDataSource,
  useArchbaseDataSource
} from '@archbase/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ClienteDto } from '../domain/ClienteDto';
import { ClienteRemoteService } from '../service/ClienteRemoteService';

interface ClienteFormProps {
  ClienteId?: string;
}

const validator = yup.object({
  nome: yup.string().required(),
  email: yup.string().email().required(),
  telefone: yup.string().required(),
  status: yup.string().required(),
  roles: yup.array().required(),
});

export function ClienteForm({ ClienteId }: ClienteFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action') || 'ADD';
  const isViewMode = action === 'VIEW';
  const isEditMode = action === 'EDIT';
  
  // Remote DataSource for main entity
  const { dataSource, isLoading, error } = useArchbaseRemoteDataSource<ClienteDto, string>({
    name: 'dsCliente',
    label: 'Cliente',
    service: ClienteRemoteService, // Inject via IOC
    pageSize: 50,
    loadOnStart: true,
    validator,
    id: isEditMode || isViewMode ? ClienteId : undefined,
    onLoadComplete: (dataSource) => {
      if (action === 'ADD') {
        dataSource.append(ClienteDto.newInstance());
      }
    }
  });


  const handleBeforeSave = useCallback(async (entity: ClienteDto) => {
    // Custom validation or business logic before save
    return true;
  }, []);

  const handleAfterSave = useCallback((entity: ClienteDto) => {
    // Navigate back to list or show success message
    navigate('/cliente');
  }, [navigate]);

  const handleCancel = useCallback(() => {
    navigate('/cliente');
  }, [navigate]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>Erro ao carregar dados: {error.message}</div>;
  }

  return (
    <ArchbaseFormTemplate
      title="Novo Cliente"
      dataSource={dataSource}
      onBeforeSave={handleBeforeSave}
      onAfterSave={handleAfterSave}
      onCancel={handleCancel}
      readOnly={isViewMode}
    >
      <ArchbaseEdit
        label="Nome"
        dataSource={dataSource}
        dataField="nome"
        required
        placeholder="Enter nome..."
      />
      <ArchbaseEdit
        label="Email"
        dataSource={dataSource}
        dataField="email"
        type="email"
        required
        placeholder="Enter email..."
      />
      <ArchbaseEdit
        label="Telefone"
        dataSource={dataSource}
        dataField="telefone"
        required
        placeholder="Enter telefone..."
      />
      <ArchbaseSelect
        label="Status"
        dataSource={dataSource}
        dataField="status"
        required
      >
      </ArchbaseSelect>
      <ArchbaseTextArea
        label="Roles (Array - separado por linha)"
        dataSource={dataSource}
        dataField="roles"
        required
        placeholder="Um item por linha"
        rows={4}
      />
    </ArchbaseFormTemplate>
  );
}

export default ClienteForm;