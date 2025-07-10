import React from 'react';
import * as yup from 'yup';
import { ArchbaseEdit } from 'archbase-react';
import { Button } from '@mantine/core';

interface UserFormProps {
  onSubmit: (values: User) => Promise<void>;
  
}

interface User {
  name: string;
  email: string;
  active: string;
}

const validationSchema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required(),
  active: yup.string().required(),
});

const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  
}) => {
  const fields: FieldConfig[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'Enter name...',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'Enter email...',
    },
    {
      name: 'active',
      label: 'Active',
      type: 'boolean',
      required: true,
      placeholder: 'Enter active...',
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

export { UserForm };
export default UserForm;