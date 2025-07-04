import React, { useState } from 'react';
import {
  ArchbaseDataGrid,
  ArchbaseDataGridColumn,
  useArchbaseRemoteDataSource,
  isAdministrator
} from 'archbase-react';
import { ActionIcon, Button, Group, TextInput } from '@mantine/core';
import { IconEdit, IconTrash, IconEye, IconPlus, IconSearch } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  stock: number;
  createdAt: Date;
}

export function ProductGridExample() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize DataSource V2 for grid
  const dataSource = useArchbaseRemoteDataSource<ProductDto, string>({
    name: 'products',
    endPointUrl: '/api/products',
    pageSize: 25,
    updateType: 'auto',
    filter: searchTerm ? `name.contains("${searchTerm}")` : undefined
  });

  const handleAdd = () => {
    navigate('/admin/products/product/new');
  };

  const handleEdit = (product: ProductDto) => {
    navigate(`/admin/products/product/${product.id}`);
  };

  const handleView = (product: ProductDto) => {
    navigate(`/admin/products/product/${product.id}?mode=view`);
  };

  const handleDelete = async (product: ProductDto) => {
    if (window.confirm(`Deseja excluir o produto "${product.name}"?`)) {
      try {
        await dataSource.deleteRecord(product);
        await dataSource.save();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleSearch = () => {
    dataSource.filter(`name.contains("${searchTerm}")`);
  };

  return (
    <ArchbaseDataGrid
      dataSource={dataSource}
      enableRowActions
      renderRowActions={(row) => (
        <Group spacing={4}>
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => handleView(row.original)}
            title="Visualizar"
          >
            <IconEye size={16} />
          </ActionIcon>
          {isAdministrator() && (
            <>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => handleEdit(row.original)}
                title="Editar"
              >
                <IconEdit size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => handleDelete(row.original)}
                title="Excluir"
              >
                <IconTrash size={16} />
              </ActionIcon>
            </>
          )}
        </Group>
      )}
      toolbarLeftContent={
        <Group>
          {isAdministrator() && (
            <Button
              leftIcon={<IconPlus size={16} />}
              onClick={handleAdd}
            >
              Adicionar Produto
            </Button>
          )}
          <TextInput
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            rightSection={
              <ActionIcon onClick={handleSearch}>
                <IconSearch size={16} />
              </ActionIcon>
            }
          />
        </Group>
      }
      withBorder
      striped
      pageSize={25}
    >
      <ArchbaseDataGridColumn
        accessor="name"
        header="Nome"
        enableSorting
        enableColumnFilter
      />
      <ArchbaseDataGridColumn
        accessor="category"
        header="Categoria"
        enableSorting
        enableColumnFilter
      />
      <ArchbaseDataGridColumn
        accessor="price"
        header="Preço"
        enableSorting
        cell={({ getValue }) => 
          new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(getValue() as number)
        }
      />
      <ArchbaseDataGridColumn
        accessor="stock"
        header="Estoque"
        enableSorting
        cell={({ getValue }) => {
          const stock = getValue() as number;
          return (
            <span style={{ 
              color: stock < 10 ? 'red' : stock < 50 ? 'orange' : 'green' 
            }}>
              {stock}
            </span>
          );
        }}
      />
      <ArchbaseDataGridColumn
        accessor="status"
        header="Status"
        enableColumnFilter
        filterFn="equals"
        cell={({ getValue }) => {
          const status = getValue() as string;
          const statusMap = {
            'ACTIVE': { label: 'Ativo', color: 'green' },
            'INACTIVE': { label: 'Inativo', color: 'gray' },
            'DISCONTINUED': { label: 'Descontinuado', color: 'red' }
          };
          const config = statusMap[status];
          return (
            <span style={{ color: config.color }}>
              {config.label}
            </span>
          );
        }}
      />
      <ArchbaseDataGridColumn
        accessor="createdAt"
        header="Criado em"
        enableSorting
        cell={({ getValue }) => 
          new Date(getValue() as Date).toLocaleDateString('pt-BR')
        }
      />
    </ArchbaseDataGrid>
  );
}