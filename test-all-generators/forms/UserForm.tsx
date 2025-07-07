ArchbaseEdit
Button

interface UserFormProps {
  onSubmit: (values: User) => Promise<void>;
  
}

interface User {
  name: text;
  email: email;
  age: number;
}

const validationSchema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required(),
  age: yup.number().required(),
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
      name: 'age',
      label: 'Age',
      type: 'number',
      required: true,
      placeholder: 'Enter age...',
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