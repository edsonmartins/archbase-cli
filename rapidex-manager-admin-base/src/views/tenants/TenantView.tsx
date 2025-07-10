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
} from 'archbase-react';
import { useTranslation } from 'react-i18next';
import { TenantDto } from '../../domain/TenantDto';
import { TenantService } from '../../services/TenantService';
import { API_TYPE } from '../../ioc/RapidexManagerAdminBaseIOCTypes';

interface TenantViewProps {}

// Navigation constants (following powerview-admin pattern)
const TENANT_ROUTE = '/admin/tenants/tenant';

// Actions constants
const ADD_ACTION = 'ADD';
const EDIT_ACTION = 'EDIT';
const VIEW_ACTION = 'VIEW';

function TenantView({}: TenantViewProps) {
  const { t } = useTranslation();
  const loggedUser = useArchbaseGetLoggedUser();
  const templateStore = useArchbaseStore('tenantStore');
  const serviceApi = useArchbaseRemoteServiceApi<TenantService>(API_TYPE.Tenant);
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
    TenantDto,
    string
  >({
    name: 'dsTenant',
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
      TENANT_ROUTE + '/novo-' + Date.now(),
      {},
      { action: ADD_ACTION, redirectUrl: TENANT_ROUTE }
    );
  }, [navigate]);

  const handleEdit = useCallback(() => {
    const record = dataSource.getCurrentRecord();
    if (record) {
      navigate(
        TENANT_ROUTE + '/' + record.id,
        {},
        { action: EDIT_ACTION, redirectUrl: TENANT_ROUTE }
      );
    }
  }, [dataSource, navigate]);

  const handleView = useCallback(() => {
    const record = dataSource.getCurrentRecord();
    if (record) {
      navigate(
        TENANT_ROUTE + '/' + record.id,
        {},
        { action: VIEW_ACTION, redirectUrl: TENANT_ROUTE }
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
  const buildRowActions = useCallback((row: TenantDto): React.ReactNode => {
    return (
      <Group gap={4} wrap="nowrap">
        <ActionIcon variant="transparent" color="gray" onClick={() => {
          dataSource.gotoRecordByData(row);
          handleView();
        }}>
          <IconEye size={22} />
        </ActionIcon>
        
        {isAdministrator() && (
          <>
            <ActionIcon variant="transparent" color="blue" onClick={() => {
              dataSource.gotoRecordByData(row);
              handleEdit();
            }}>
              <IconEdit size={22} />
            </ActionIcon>
            <ActionIcon variant="transparent" color="red" onClick={() => {
              dataSource.gotoRecordByData(row);
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
          header={t('Código')}
          inputFilterType="text"
          size={120}
        />
        <ArchbaseDataGridColumn
          dataField="name"
          dataType="text"
          header={t('Nome')}
          inputFilterType="text"
          size={200}
        />
        <ArchbaseDataGridColumn
          dataField="state"
          dataType="text"
          header={t('Estado')}
          inputFilterType="text"
          size={120}
        />
        <ArchbaseDataGridColumn
          dataField="country"
          dataType="text"
          header={t('País')}
          inputFilterType="text"
          size={120}
        />
        <ArchbaseDataGridColumn
          dataField="isActive"
          dataType="boolean"
          header={t('Ativo')}
          inputFilterType="select"
          size={80}
        />
      </Columns>
    );
  }, [t]);

  return (
    <Paper>
      <ArchbaseDataGrid<TenantDto, string>
        gridRef={gridRef}
        printTitle={t('Tenant')}
        width={'100%'}
        height={'100%'}
        withBorder={false}
        dataSource={dataSource}
        withColumnBorders={true}
        striped={true}
        enableTopToolbar={true}
        enableRowActions={true}
        pageSize={25}
        isLoading={isLoading}
        isError={isError || lastError !== ''}
        error={error || lastError}
        enableGlobalFilter={true}
        getRowId={(row: TenantDto) => row.id}
        toolbarLeftContent={renderToolbarActions()}
        renderRowActions={buildRowActions}
        children={columns}
      />
    </Paper>
  );
}

export { TenantView };
export default TenantView;