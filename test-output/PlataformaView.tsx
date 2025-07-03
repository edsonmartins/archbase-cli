import React, { useMemo, useRef, useState, useCallback } from 'react';
import { 
  Paper,
  Group,
  Button,
  ActionIcon,
  Flex
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrashX,
  IconEye,
  IconTrash
} from '@tabler/icons-react';
import {
  ArchbaseDataGrid,
  ArchbaseDataGridColumn,
  Columns,
  useArchbaseRemoteDataSource,
  useArchbaseStore,
  useArchbaseRemoteServiceApi,
  useArchbaseGetLoggedUser,
  useArchbaseNavigateParams,
  useArchbaseTheme,
  ArchbaseNotifications,
  ArchbaseDialog
} from '@archbase/react';
import { useTranslation } from 'react-i18next';
import { PlataformaDto } from '../domain/PlataformaDto';
import { PlataformaRemoteService } from '../service/PlataformaRemoteService';
import { API_TYPE } from '../ioc/types';

interface PlataformaViewProps {}

// Navigation constants (following powerview-admin pattern)
const PLATAFORMA_ROUTE = '/admin/configuracao/plataforma';

// Actions constants
const ADD_ACTION = 'ADD';
const EDIT_ACTION = 'EDIT';
const VIEW_ACTION = 'VIEW';

export function PlataformaView({}: PlataformaViewProps) {
  const { t } = useTranslation();
  const loggedUser = useArchbaseGetLoggedUser();
  const templateStore = useArchbaseStore('plataformaStore');
  const serviceApi = useArchbaseRemoteServiceApi<PlataformaRemoteService>(API_TYPE.Plataforma);
  const navigate = useArchbaseNavigateParams();
  const [lastError, setLastError] = useState<string>('');
  const gridRef = useRef<any>(null);
  const theme = useArchbaseTheme();

  // Permission check (admin-only operations)
  const isAdministrator = (): boolean => {
    if (!loggedUser) {
      return false;
    }
    return loggedUser.isAdmin;
  };

  // Remote DataSource configuration
  const { dataSource, isLoading, error, isError } = useArchbaseRemoteDataSource<
    PlataformaDto,
    string
  >({
    name: 'dsPlataforma',
    service: serviceApi,
    store: templateStore,
    pageSize: 25,
    loadOnStart: true,
    onError: (error, origin) => {
      ArchbaseNotifications.showError(t('WARNING'), error, origin);
    }
  });

  // Navigation handlers
  const handleAdd = useCallback(() => {
    navigate(
      PLATAFORMA_ROUTE + '/novo-' + Date.now(),
      {},
      { action: ADD_ACTION, redirectUrl: PLATAFORMA_ROUTE }
    );
  }, [navigate]);

  const handleEdit = useCallback(() => {
    const record = dataSource.getCurrentRecord();
    if (record) {
      navigate(
        PLATAFORMA_ROUTE + '/' + record.id,
        {},
        { action: EDIT_ACTION, redirectUrl: PLATAFORMA_ROUTE }
      );
    }
  }, [dataSource, navigate]);

  const handleView = useCallback(() => {
    const record = dataSource.getCurrentRecord();
    if (record) {
      navigate(
        PLATAFORMA_ROUTE + '/' + record.id,
        {},
        { action: VIEW_ACTION, redirectUrl: PLATAFORMA_ROUTE }
      );
    }
  }, [dataSource, navigate]);

  const handleRemove = useCallback(() => {
    if (!dataSource.isEmpty()) {
      const record = dataSource.getCurrentRecord();
      if (record) {
        ArchbaseDialog.showConfirmDialogYesNo(
          `${t('Confirme')}`,
          `${t('Deseja remover este registro')} ?`,
          () => {
            dataSource.remove();
          },
          () => {}
        );
      }
    }
  }, [dataSource, t]);

  // Row actions
  const buildRowActions = useCallback((row: PlataformaDto): React.ReactNode => {
    return (
      <Group gap={4} wrap="nowrap">
        <ActionIcon variant="transparent" color="gray" onClick={() => {
          dataSource.locateRecord(row);
          handleView();
        }}>
          <IconEye size={22} />
        </ActionIcon>
        
        {isAdministrator() && (
          <>
            <ActionIcon variant="transparent" color="blue" onClick={() => {
              dataSource.locateRecord(row);
              handleEdit();
            }}>
              <IconEdit size={22} />
            </ActionIcon>
            <ActionIcon variant="transparent" color="red" onClick={() => {
              dataSource.locateRecord(row);
              handleRemove();
            }}>
              <IconTrash size={22} />
            </ActionIcon>
          </>
        )}
      </Group>
    );
  }, [dataSource, handleView, handleEdit, handleRemove, isAdministrator]);

  // Toolbar actions
  const renderToolbarActions = useCallback(() => {
    return (
      <Group align="end" gap={'8px'} wrap="nowrap">
        {isAdministrator() && (
          <>
            <Button color={'green'} leftSection={<IconPlus />} onClick={handleAdd}>
              {t('Novo')}
            </Button>
            <Button color={'blue'} leftSection={<IconEdit />} onClick={handleEdit}>
              {t('Editar')}
            </Button>
            <Button color={'red'} leftSection={<IconTrashX />} onClick={handleRemove}>
              {t('Remover')}
            </Button>
          </>
        )}
        <Button color={'gray'} leftSection={<IconEye />} onClick={handleView}>
          {t('Visualizar')}
        </Button>
      </Group>
    );
  }, [handleAdd, handleEdit, handleRemove, handleView, isAdministrator, t]);

  // Column definitions
  const columns = useMemo(() => {
    return (
      <Columns>
        <ArchbaseDataGridColumn
          dataField="code"
          dataType="text"
          header={t('Code')}
          inputFilterType="text"
          
          
        />
        <ArchbaseDataGridColumn
          dataField="nome"
          dataType="text"
          header={t('Nome')}
          inputFilterType="text"
          
          
        />
        <ArchbaseDataGridColumn
          dataField="status"
          dataType="enum"
          header={t('Status')}
          inputFilterType="select"
          size=120
          
        />
      </Columns>
    );
  }, [t]);

  return (
    <Paper>
      <ArchbaseDataGrid<PlataformaDto, string>
        gridRef={gridRef}
        printTitle={t('Plataforma')}
        width={'100%'}
        height={'100%'}
        withBorder={false}
        dataSource={dataSource}
        withColumnBorders={true}
        striped={true}
        enableTopToolbar={true}
        enableRowActions={true}
        pageSize=25
        isLoading={isLoading}
        isError={isError || lastError !== ''}
        error={error || lastError}
        enableGlobalFilter={true}
        getRowId={(row: PlataformaDto) => row.id}
        toolbarLeftContent={renderToolbarActions()}
        renderRowActions={buildRowActions}
        children={columns}
      />
    </Paper>
  );
}

export default PlataformaView;