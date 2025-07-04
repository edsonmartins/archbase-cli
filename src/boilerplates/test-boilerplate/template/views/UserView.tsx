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
import { UserDto } from '../domain/UserDto';
import { UserRemoteService } from '../service/UserRemoteService';
import { API_TYPE } from '../ioc/types';

interface UserViewProps {}

// Navigation constants (following powerview-admin pattern)
const USER_ROUTE = '/admin/configuracao/user';

// Actions constants
const ADD_ACTION = 'ADD';
const EDIT_ACTION = 'EDIT';
const VIEW_ACTION = 'VIEW';

export function UserView({}: UserViewProps) {
  const { t } = useTranslation();
  const loggedUser = useArchbaseGetLoggedUser();
  const templateStore = useArchbaseStore('userStore');
  const serviceApi = useArchbaseRemoteServiceApi<UserRemoteService>(API_TYPE.User);
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
    UserDto,
    string
  >({
    name: 'dsUser',
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
      USER_ROUTE + '/novo-' + Date.now(),
      {},
      { action: ADD_ACTION, redirectUrl: USER_ROUTE }
    );
  }, [navigate]);

  const handleEdit = useCallback(() => {
    const record = dataSource.getCurrentRecord();
    if (record) {
      navigate(
        USER_ROUTE + '/' + record.id,
        {},
        { action: EDIT_ACTION, redirectUrl: USER_ROUTE }
      );
    }
  }, [dataSource, navigate]);

  const handleView = useCallback(() => {
    const record = dataSource.getCurrentRecord();
    if (record) {
      navigate(
        USER_ROUTE + '/' + record.id,
        {},
        { action: VIEW_ACTION, redirectUrl: USER_ROUTE }
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
  const buildRowActions = useCallback((row: UserDto): React.ReactNode => {
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
          dataField="name"
          dataType="text"
          header={t('Name')}
          inputFilterType="text"
          
          
        />
        <ArchbaseDataGridColumn
          dataField="email"
          dataType="text"
          header={t('Email')}
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
      <ArchbaseDataGrid<UserDto, string>
        gridRef={gridRef}
        printTitle={t('User')}
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
        getRowId={(row: UserDto) => row.id}
        toolbarLeftContent={renderToolbarActions()}
        renderRowActions={buildRowActions}
        children={columns}
      />
    </Paper>
  );
}

export default UserView;