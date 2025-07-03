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
import { PlataformaDto } from '../domain/PlataformaDto';
import { PlataformaRemoteService } from '../service/PlataformaRemoteService';

interface PlataformaFormProps {
  PlataformaId?: string;
}

// Navigation constants (following powerview-admin pattern)
const plataforma_ROUTE = '/admin/configuracao/plataforma';
const plataforma_FORM_ROUTE = '/admin/configuracao/plataforma/:plataformaId';

const validator = yup.object({
  nome: yup.string().required(),
  descricao: yup.string().required(),
  status: yup.string().required(),
});

export function PlataformaForm({ PlataformaId }: PlataformaFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Admin navigation pattern: action parameter determines form mode
  const action = searchParams.get('action') || 'ADD';
  const isViewMode = action === 'VIEW';
  const isEditMode = action === 'EDIT';
  
  // Remote DataSource for main entity
  const { dataSource, isLoading, error } = useArchbaseRemoteDataSource<PlataformaDto, string>({
    name: 'dsPlataforma',
    label: 'Plataforma',
    service: PlataformaRemoteService, // Inject via IOC
    pageSize: 50,
    loadOnStart: true,
    validator,
    id: isEditMode || isViewMode ? PlataformaId : undefined,
    onLoadComplete: (dataSource) => {
      if (action === 'ADD') {
        dataSource.append(PlataformaDto.newInstance());
      }
    }
  });


  const handleBeforeSave = useCallback(async (entity: PlataformaDto) => {
    // Custom validation or business logic before save
    return true;
  }, []);

  const handleAfterSave = useCallback((entity: PlataformaDto) => {
    // Navigate back to list view using admin route pattern
    navigate(plataforma_ROUTE);
  }, [navigate]);

  const handleCancel = useCallback(() => {
    navigate(plataforma_ROUTE);
  }, [navigate]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>Erro ao carregar dados: {error.message}</div>;
  }

  return (
    <ArchbaseFormTemplate
      title={`${isEditMode ? 'Editar' : isViewMode ? 'Visualizar' : 'Novo'} Plataforma`}
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
      <ArchbaseTextArea
        label="Descricao"
        dataSource={dataSource}
        dataField="descricao"
        required
        placeholder="Enter descricao..."
      />
      <ArchbaseSelect
        label="Status"
        dataSource={dataSource}
        dataField="status"
        required
      >
      </ArchbaseSelect>
    </ArchbaseFormTemplate>
  );
}

export default PlataformaForm;