import React from 'react';
import * as yup from 'yup';
import { ArchbaseEdit } from 'archbase-react';
import { Button } from '@mantine/core';

interface TenantFormProps {
  onSubmit: (values: Tenant) => Promise<void>;
  
}

interface Tenant {
  data: string;
  object: string;
}

const validationSchema = yup.object({
  data: yup.string().required(),
  object: yup.string().required(),
});

const TenantForm: React.FC<TenantFormProps> = ({
  onSubmit,
  
}) => {
  const fields: FieldConfig[] = [
    {
      name: 'data',
      label: 'Data',
      type: 'text',
      
      placeholder: 'Enter data...',
    },
    {
      name: 'object',
      label: 'Object',
      type: 'text',
      
      placeholder: 'Enter object...',
    },
  ];

  return (
    <FormBuilder
      fields={fields}
      validation={validationSchema}
      onSubmit={onSubmit}
      
    />
  );
};

export { TenantForm };
export default TenantForm;