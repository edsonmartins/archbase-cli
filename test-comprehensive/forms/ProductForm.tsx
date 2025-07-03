import React from 'react';
import { ArchbaseEdit, ArchbaseButton } from '@archbase/react';
import * as yup from 'yup';

interface ProductFormProps {
  onSubmit: (values: Product) => Promise<void>;
  
}

interface Product {
  id: number;
  name: string;
  price: number;
  status: string;
  category: string;
}

const validationSchema = yup.object({
  id: yup.number().required(),
  name: yup.string().required(),
  price: yup.string().required(),
  status: yup.string().required(),
  category: yup.string().required(),
});

const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  
}) => {
  const fields: FieldConfig[] = [
    {
      name: 'id',
      label: 'Id',
      type: 'number',
      required: true,
      placeholder: 'Enter id...',
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'Enter name...',
    },
    {
      name: 'price',
      label: 'Price',
      type: 'decimal',
      required: true,
      placeholder: 'Enter price...',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'enum',
      required: true,
      placeholder: 'Enter status...',
    },
    {
      name: 'category',
      label: 'Category',
      type: 'text',
      required: true,
      placeholder: 'Enter category...',
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

export default ProductForm;