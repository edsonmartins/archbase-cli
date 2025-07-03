import React, { useState } from 'react';
import {
  ArchbaseLookupEdit,
  ArchbaseDataGrid,
  ArchbaseDataGridColumn,
  useArchbaseRemoteDataSource,
  ArchbaseModal
} from '@archbase/react';
import { Button, Group, TextInput, Stack, Badge } from '@mantine/core';
import { IconSearch, IconPackage } from '@tabler/icons-react';

interface ProductDto {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: 'ACTIVE' | 'INACTIVE';
  image?: string;
}

interface OrderItemDto {
  id?: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
}

export function LookupProductsExample() {
  const [lookupVisible, setLookupVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // DataSource for the form
  const orderItemDataSource = useArchbaseRemoteDataSource<OrderItemDto, string>({
    name: 'orderItem',
    endPointUrl: '/api/order-items',
    inserting: true
  });

  // DataSource for lookup products
  const productsDataSource = useArchbaseRemoteDataSource<ProductDto, string>({
    name: 'products',
    endPointUrl: '/api/products',
    pageSize: 10,
    filter: searchTerm ? `name.contains("${searchTerm}") OR code.contains("${searchTerm}")` : undefined
  });

  const handleProductSelect = (product: ProductDto) => {
    orderItemDataSource.setFieldValue('productId', product.id);
    orderItemDataSource.setFieldValue('productName', product.name);
    orderItemDataSource.setFieldValue('unitPrice', product.price);
    setLookupVisible(false);
  };

  const handleSearch = () => {
    productsDataSource.filter(
      searchTerm 
        ? `name.contains("${searchTerm}") OR code.contains("${searchTerm}")`
        : undefined
    );
  };

  const getSelectedProductInfo = () => {
    const productId = orderItemDataSource.getFieldValue('productId');
    const productName = orderItemDataSource.getFieldValue('productName');
    
    if (productId && productName) {
      return `${productName} (ID: ${productId})`;
    }
    return '';
  };

  return (
    <Stack spacing="md">
      <ArchbaseLookupEdit<OrderItemDto, string, ProductDto>
        label="Produto"
        placeholder="Clique para buscar um produto..."
        dataSource={orderItemDataSource}
        dataField="productId"
        lookupDataSource={productsDataSource}
        onLookup={() => setLookupVisible(true)}
        getOptionLabel={(product) => product.name}
        getOptionValue={(product) => product.id}
        displayValue={getSelectedProductInfo()}
        rightSection={<IconPackage size={16} />}
        required
      />

      {/* Lookup Modal */}
      <ArchbaseModal
        opened={lookupVisible}
        onClose={() => setLookupVisible(false)}
        title="Selecionar Produto"
        size="xl"
      >
        <Stack spacing="md">
          <Group>
            <TextInput
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{ flex: 1 }}
            />
            <Button onClick={handleSearch} leftIcon={<IconSearch size={16} />}>
              Buscar
            </Button>
          </Group>

          <ArchbaseDataGrid
            dataSource={productsDataSource}
            onRowDoubleClick={handleProductSelect}
            enableRowSelection
            onRowClick={handleProductSelect}
            pageSize={10}
            height={400}
          >
            <ArchbaseDataGridColumn
              accessor="code"
              header="Código"
              enableSorting
              width={100}
            />
            <ArchbaseDataGridColumn
              accessor="name"
              header="Nome"
              enableSorting
              minWidth={200}
            />
            <ArchbaseDataGridColumn
              accessor="category"
              header="Categoria"
              enableSorting
              width={150}
            />
            <ArchbaseDataGridColumn
              accessor="price"
              header="Preço"
              enableSorting
              width={120}
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
              width={100}
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
              width={100}
              cell={({ getValue }) => (
                <Badge 
                  color={getValue() === 'ACTIVE' ? 'green' : 'gray'}
                  variant="light"
                >
                  {getValue() === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                </Badge>
              )}
            />
          </ArchbaseDataGrid>

          <Group position="right">
            <Button variant="subtle" onClick={() => setLookupVisible(false)}>
              Cancelar
            </Button>
          </Group>
        </Stack>
      </ArchbaseModal>
    </Stack>
  );
}

// Advanced lookup with filters
export function AdvancedLookupExample() {
  const [lookupVisible, setLookupVisible] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceMin: '',
    priceMax: '',
    inStock: false
  });

  const orderDataSource = useArchbaseRemoteDataSource<OrderItemDto, string>({
    name: 'orderItem',
    endPointUrl: '/api/order-items',
    inserting: true
  });

  const productsDataSource = useArchbaseRemoteDataSource<ProductDto, string>({
    name: 'products',
    endPointUrl: '/api/products',
    pageSize: 15
  });

  const applyFilters = () => {
    const filterConditions = [];
    
    if (filters.category) {
      filterConditions.push(`category.equals("${filters.category}")`);
    }
    
    if (filters.priceMin) {
      filterConditions.push(`price.greaterThanOrEqual(${filters.priceMin})`);
    }
    
    if (filters.priceMax) {
      filterConditions.push(`price.lessThanOrEqual(${filters.priceMax})`);
    }
    
    if (filters.inStock) {
      filterConditions.push('stock.greaterThan(0)');
    }

    const filterString = filterConditions.join(' AND ');
    productsDataSource.filter(filterString || undefined);
  };

  const categoryOptions = [
    'Eletrônicos',
    'Roupas',
    'Casa e Jardim',
    'Esportes',
    'Livros'
  ];

  return (
    <Stack spacing="md">
      <ArchbaseLookupEdit<OrderItemDto, string, ProductDto>
        label="Produto (Busca Avançada)"
        placeholder="Clique para buscar com filtros..."
        dataSource={orderDataSource}
        dataField="productId"
        lookupDataSource={productsDataSource}
        onLookup={() => setLookupVisible(true)}
        getOptionLabel={(product) => `${product.name} - ${product.code}`}
        getOptionValue={(product) => product.id}
        helperText="Use a busca avançada para filtrar produtos"
      />

      <ArchbaseModal
        opened={lookupVisible}
        onClose={() => setLookupVisible(false)}
        title="Busca Avançada de Produtos"
        size="xl"
      >
        <Stack spacing="md">
          {/* Advanced Filters */}
          <Group grow>
            <Select
              label="Categoria"
              placeholder="Todas as categorias"
              data={categoryOptions.map(cat => ({ value: cat, label: cat }))}
              value={filters.category}
              onChange={(value) => setFilters(prev => ({ ...prev, category: value || '' }))}
              clearable
            />
            <TextInput
              label="Preço Mínimo"
              placeholder="0.00"
              value={filters.priceMin}
              onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
              type="number"
            />
            <TextInput
              label="Preço Máximo"
              placeholder="999.99"
              value={filters.priceMax}
              onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
              type="number"
            />
          </Group>

          <Group>
            <Checkbox
              label="Apenas produtos em estoque"
              checked={filters.inStock}
              onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
            />
            <Button onClick={applyFilters}>
              Aplicar Filtros
            </Button>
            <Button 
              variant="subtle" 
              onClick={() => {
                setFilters({ category: '', priceMin: '', priceMax: '', inStock: false });
                productsDataSource.filter(undefined);
              }}
            >
              Limpar Filtros
            </Button>
          </Group>

          <ArchbaseDataGrid
            dataSource={productsDataSource}
            onRowDoubleClick={(product) => {
              orderDataSource.setFieldValue('productId', product.id);
              orderDataSource.setFieldValue('productName', product.name);
              orderDataSource.setFieldValue('unitPrice', product.price);
              setLookupVisible(false);
            }}
            pageSize={15}
            height={400}
          >
            <ArchbaseDataGridColumn accessor="code" header="Código" width={100} />
            <ArchbaseDataGridColumn accessor="name" header="Nome" minWidth={250} />
            <ArchbaseDataGridColumn accessor="category" header="Categoria" width={150} />
            <ArchbaseDataGridColumn 
              accessor="price" 
              header="Preço" 
              width={120}
              cell={({ getValue }) => 
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(getValue() as number)
              }
            />
            <ArchbaseDataGridColumn accessor="stock" header="Estoque" width={100} />
          </ArchbaseDataGrid>
        </Stack>
      </ArchbaseModal>
    </Stack>
  );
}