import React, { useCallback } from 'react';
import * as yup from 'yup';
import { 
  FormBuilder, 
  FieldConfig, 
  ArchbaseDataSourceV2,
  useArchbaseDataSource
  ,
  appendToFieldArray,
  removeFromFieldArray,
  moveInFieldArray
} from '@archbase/react';

interface UserFormV2Props {
  dataSource: ArchbaseDataSourceV2<UserFormV2, string | number>;
  onSubmit?: (values: UserFormV2) => Promise<void>;
  initialValues?: Partial<UserFormV2>;
  readOnly?: boolean;
}

interface UserFormV2 {
  name: string;
  email: string;
  roles: any[];
}

const validationSchema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required(),
  roles: yup.array().required(),
});

const UserFormV2: React.FC<UserFormV2Props> = ({ 
  dataSource, 
  onSubmit,
  initialValues,
  readOnly = false 
}) => {
  // Array field management methods (DataSource V2)
  const handleAppendToArray = useCallback((fieldName: string, value: any) => {
    appendToFieldArray(dataSource, fieldName, value);
  }, [dataSource]);

  const handleRemoveFromArray = useCallback((fieldName: string, index: number) => {
    removeFromFieldArray(dataSource, fieldName, index);
  }, [dataSource]);

  const handleMoveInArray = useCallback((fieldName: string, fromIndex: number, toIndex: number) => {
    moveInFieldArray(dataSource, fieldName, fromIndex, toIndex);
  }, [dataSource]);

  const handleSubmit = useCallback(async (values: UserFormV2) => {
    try {
      // DataSource V2 automatic sync
      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  }, [onSubmit]);

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
      name: 'roles',
      label: 'Roles',
      type: 'array',
      required: true,
      arrayConfig: {
        allowAdd: true,
        allowRemove: true,
        allowMove: true,
        onAdd: (value: any) => handleAppendToArray('roles', value),
        onRemove: (index: number) => handleRemoveFromArray('roles', index),
        onMove: (fromIndex: number, toIndex: number) => handleMoveInArray('roles', fromIndex, toIndex),
      },
      placeholder: 'Enter roles...',
    },
  ];

  return (
    <div className="UserFormV2 vertical-layout">
      <FormBuilder
        dataSource={dataSource}
        fields={fields}
        validation={validationSchema}
        onSubmit={handleSubmit}
        initialValues={initialValues}
        readOnly={readOnly}
        layout="vertical"
        enableArrayFields={true}
      />
    </div>
  );
};

UserFormV2.defaultProps = {
  readOnly: false,
};

export default UserFormV2;