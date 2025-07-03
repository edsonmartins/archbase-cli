ArchbaseEdit
ArchbaseButton

interface UserFormProps {
  onSubmit: (values: User) => Promise<void>;
  
}

interface User {
  message: text;
  data: text;
}

const validationSchema = yup.object({
  message: yup.string().required(),
  data: yup.string().required(),
});

const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  
}) => {
  const fields: FieldConfig[] = [
    {
      name: 'message',
      label: 'Message',
      type: 'text',
      
      placeholder: 'Enter message...',
    },
    {
      name: 'data',
      label: 'Data',
      type: 'text',
      
      placeholder: 'Enter data...',
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

export default UserForm;