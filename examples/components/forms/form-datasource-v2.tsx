import React from 'react';
import {
  ArchbaseFormTemplate,
  ArchbaseEdit,
  ArchbaseSelect,
  ArchbaseTextArea,
  ArchbaseCheckbox,
  ArchbaseDate,
  useArchbaseRemoteDataSource,
  ArchbaseValidator
} from '@archbase/react';
import { Button, Group, Stack } from '@mantine/core';
import * as yup from 'yup';

// DTO Interface
interface UserDto {
  id?: string;
  name: string;
  email: string;
  role: string;
  birthDate: Date;
  bio?: string;
  active: boolean;
}

// Validation schema
const userSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  role: yup.string().required('Função é obrigatória'),
  birthDate: yup.date().required('Data de nascimento é obrigatória').max(new Date(), 'Data inválida'),
  bio: yup.string().max(500, 'Biografia muito longa'),
  active: yup.boolean()
});

// Role options
const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuário' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Visualizador' }
];

export function UserFormExample() {
  // Initialize DataSource V2
  const dataSource = useArchbaseRemoteDataSource<UserDto, string>({
    name: 'users',
    endPointUrl: '/api/users',
    updateType: 'manual',
    inserting: true // New record mode
  });

  // Validator
  const validator = new ArchbaseValidator(userSchema);

  const handleSave = async () => {
    try {
      if (await validator.validate(dataSource.getCurrentRecord())) {
        const result = await dataSource.save();
        console.log('User saved:', result);
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleCancel = () => {
    dataSource.cancel();
  };

  return (
    <ArchbaseFormTemplate
      dataSource={dataSource}
      validator={validator}
      onSaveComplete={(record) => console.log('Save complete:', record)}
      onError={(error) => console.error('Form error:', error)}
    >
      <Stack spacing="md">
        <ArchbaseEdit
          label="Nome completo"
          placeholder="Digite o nome completo"
          dataSource={dataSource}
          dataField="name"
          required
        />

        <ArchbaseEdit
          label="Email"
          placeholder="email@exemplo.com"
          dataSource={dataSource}
          dataField="email"
          type="email"
          required
        />

        <ArchbaseSelect
          label="Função"
          placeholder="Selecione uma função"
          dataSource={dataSource}
          dataField="role"
          data={roleOptions}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
          required
        />

        <ArchbaseDate
          label="Data de nascimento"
          placeholder="Selecione a data"
          dataSource={dataSource}
          dataField="birthDate"
          clearable
          maxDate={new Date()}
          required
        />

        <ArchbaseTextArea
          label="Biografia"
          placeholder="Conte um pouco sobre você..."
          dataSource={dataSource}
          dataField="bio"
          rows={4}
          autosize
          minRows={3}
          maxRows={6}
        />

        <ArchbaseCheckbox
          label="Usuário ativo"
          description="Marque para ativar o usuário no sistema"
          dataSource={dataSource}
          dataField="active"
        />

        <Group position="right" mt="md">
          <Button variant="subtle" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar
          </Button>
        </Group>
      </Stack>
    </ArchbaseFormTemplate>
  );
}