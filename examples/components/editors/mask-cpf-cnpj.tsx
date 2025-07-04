import React, { useState } from 'react';
import {
  ArchbaseMaskEdit,
  MaskPattern,
  useArchbaseRemoteDataSource
} from 'archbase-react';
import { Stack, Group, Button, Text } from '@mantine/core';

interface CompanyDto {
  id?: string;
  name: string;
  document: string;
  phone: string;
  zipCode: string;
  vehiclePlate?: string;
}

export function MaskCpfCnpjExample() {
  const dataSource = useArchbaseRemoteDataSource<CompanyDto, string>({
    name: 'companies',
    endPointUrl: '/api/companies',
    inserting: true
  });

  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cnpj');

  // Dynamic mask based on document type
  const getDocumentMask = () => {
    return documentType === 'cpf' ? MaskPattern.CPF : MaskPattern.CNPJ;
  };

  const handleDocumentChange = (value: string) => {
    // Auto-detect document type based on length
    const numbersOnly = value.replace(/\D/g, '');
    if (numbersOnly.length <= 11) {
      setDocumentType('cpf');
    } else {
      setDocumentType('cnpj');
    }
  };

  const validateDocument = (document: string): boolean => {
    const numbersOnly = document.replace(/\D/g, '');
    
    if (documentType === 'cpf') {
      return validateCPF(numbersOnly);
    } else {
      return validateCNPJ(numbersOnly);
    }
  };

  const validateCPF = (cpf: string): boolean => {
    if (cpf.length !== 11) return false;
    
    // CPF validation algorithm
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;

    return true;
  };

  const validateCNPJ = (cnpj: string): boolean => {
    if (cnpj.length !== 14) return false;
    
    // CNPJ validation algorithm
    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    let digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(0))) return false;
    
    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(1))) return false;
    
    return true;
  };

  return (
    <Stack spacing="md">
      <Text size="lg" weight={500}>Formulário com Máscaras Brasileiras</Text>
      
      <ArchbaseMaskEdit
        label={`Documento (${documentType.toUpperCase()})`}
        placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
        dataSource={dataSource}
        dataField="document"
        mask={getDocumentMask()}
        onChange={handleDocumentChange}
        error={
          dataSource.getFieldValue('document') && 
          !validateDocument(dataSource.getFieldValue('document'))
            ? `${documentType.toUpperCase()} inválido`
            : undefined
        }
        required
      />

      <ArchbaseMaskEdit
        label="Telefone"
        placeholder="(00) 00000-0000"
        dataSource={dataSource}
        dataField="phone"
        mask={MaskPattern.PHONE}
        required
      />

      <ArchbaseMaskEdit
        label="CEP"
        placeholder="00.000-000"
        dataSource={dataSource}
        dataField="zipCode"
        mask={MaskPattern.CEP}
        onChange={(value) => {
          // Auto-complete address based on CEP
          if (value.replace(/\D/g, '').length === 8) {
            console.log('CEP complete, fetch address:', value);
          }
        }}
      />

      <ArchbaseMaskEdit
        label="Placa do Veículo"
        placeholder="ABC-1234 ou ABC-1D23"
        dataSource={dataSource}
        dataField="vehiclePlate"
        mask={MaskPattern.PLACA}
        helperText="Formato antigo (ABC-1234) ou Mercosul (ABC-1D23)"
      />

      <Group position="right" mt="md">
        <Button variant="outline">
          Cancelar
        </Button>
        <Button>
          Salvar
        </Button>
      </Group>
    </Stack>
  );
}

// Example with custom masks
export function CustomMaskExample() {
  const [value, setValue] = useState('');

  return (
    <Stack spacing="md">
      <Text size="lg" weight={500}>Máscaras Customizadas</Text>

      {/* Custom mask for product code */}
      <ArchbaseMaskEdit
        label="Código do Produto"
        placeholder="PRD-000000"
        mask="aaa-000000"
        value={value}
        onChange={setValue}
        helperText="Formato: 3 letras + hífen + 6 números"
      />

      {/* Custom mask for credit card */}
      <ArchbaseMaskEdit
        label="Cartão de Crédito"
        placeholder="0000 0000 0000 0000"
        mask="0000 0000 0000 0000"
        helperText="16 dígitos do cartão"
      />

      {/* Custom mask for time */}
      <ArchbaseMaskEdit
        label="Horário"
        placeholder="00:00"
        mask="00:00"
        helperText="Formato 24 horas"
      />

      {/* Custom mask for version */}
      <ArchbaseMaskEdit
        label="Versão"
        placeholder="0.0.0"
        mask="0.0.0"
        helperText="Versionamento semântico"
      />
    </Stack>
  );
}