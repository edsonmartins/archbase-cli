import React from 'react';
import * as yup from 'yup';
import { ArchbaseEdit } from '@archbase/components';
import { Button } from '@mantine/core';

interface TestFormProps {
  onSubmit: (values: Test) => Promise<void>;
  
}

interface Test {
  name: string;
  email: string;
}

const validationSchema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required(),
});

const TestForm: React.FC<TestFormProps> = ({
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
  ];

  return (
    <FormBuilder
      fields={fields}
      validation={validationSchema}
      onSubmit={onSubmit}
      
    />
  );
};

export { TestForm };
export default TestForm;