import React from 'react';
import {
  ArchbaseAsyncSelect,
  OptionsResult,
  useArchbaseRemoteDataSource
} from '@archbase/react';
import axios from 'axios';

interface UserOption {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
}

interface FormData {
  responsibleUserId: string;
  approverUserId: string;
}

export function AsyncSelectUsersExample() {
  const dataSource = useArchbaseRemoteDataSource<FormData, string>({
    name: 'taskForm',
    endPointUrl: '/api/tasks',
    inserting: true
  });

  // Function to load users from API
  const loadUsers = async (
    searchValue: string,
    options: { page: number }
  ): Promise<OptionsResult<UserOption>> => {
    try {
      const response = await axios.get('/api/users/search', {
        params: {
          q: searchValue,
          page: options.page,
          limit: 20
        }
      });

      return {
        options: response.data.content,
        page: response.data.page,
        totalPages: response.data.totalPages
      };
    } catch (error) {
      console.error('Error loading users:', error);
      return { options: [], page: 0, totalPages: 0 };
    }
  };

  // Custom option rendering with avatar
  const renderUserOption = (user: UserOption) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {user.avatar && (
        <img 
          src={user.avatar} 
          alt={user.name}
          style={{ width: 32, height: 32, borderRadius: '50%' }}
        />
      )}
      <div>
        <div style={{ fontWeight: 500 }}>{user.name}</div>
        <div style={{ fontSize: 12, color: '#666' }}>
          {user.email} • {user.department}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ArchbaseAsyncSelect<FormData, string, UserOption>
        label="Usuário Responsável"
        placeholder="Digite para buscar usuários..."
        dataSource={dataSource}
        dataField="responsibleUserId"
        loadOptions={loadUsers}
        getOptionLabel={(user) => user.name}
        getOptionValue={(user) => user.id}
        clearable
        searchable
        debounce={500}
        renderOption={renderUserOption}
        helperText="Busque por nome ou email"
      />

      <ArchbaseAsyncSelect<FormData, string, UserOption>
        label="Aprovador"
        placeholder="Selecione um aprovador..."
        dataSource={dataSource}
        dataField="approverUserId"
        loadOptions={loadUsers}
        getOptionLabel={(user) => `${user.name} (${user.department})`}
        getOptionValue={(user) => user.id}
        clearable
        searchable
        debounce={300}
        required
        error={dataSource.getError('approverUserId')}
      />
    </div>
  );
}

// Example with custom loading state
export function AsyncSelectWithLoadingExample() {
  const [loading, setLoading] = React.useState(false);

  const loadDepartments = async (search: string) => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const departments = [
        { id: '1', name: 'TI', fullName: 'Tecnologia da Informação' },
        { id: '2', name: 'RH', fullName: 'Recursos Humanos' },
        { id: '3', name: 'FIN', fullName: 'Financeiro' },
        { id: '4', name: 'COM', fullName: 'Comercial' }
      ].filter(dept => 
        dept.name.toLowerCase().includes(search.toLowerCase()) ||
        dept.fullName.toLowerCase().includes(search.toLowerCase())
      );

      return {
        options: departments,
        page: 0,
        totalPages: 1
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <ArchbaseAsyncSelect
      label="Departamento"
      placeholder="Buscar departamento..."
      loadOptions={loadDepartments}
      getOptionLabel={(dept) => `${dept.name} - ${dept.fullName}`}
      getOptionValue={(dept) => dept.id}
      loading={loading}
      clearable
      nothingFound="Nenhum departamento encontrado"
    />
  );
}