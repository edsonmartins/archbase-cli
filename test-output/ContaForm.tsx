ArchbaseEdit
ArchbaseButton

interface ContaFormProps {
  onSubmit: (values: Conta) => Promise<void>;
  
}

interface Conta {
  message: text;
  message: text;
  message: text;
  data: text;
  object: text;
}

const validationSchema = yup.object({
  message: yup.string().required(),
  message: yup.string().required(),
  message: yup.string().required(),
  data: yup.string().required(),
  object: yup.string().required(),
});

const ContaForm: React.FC<ContaFormProps> = ({
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
      name: 'message',
      label: 'Message',
      type: 'text',
      required: true,
      placeholder: 'Enter message...',
    },
    {
      name: 'message',
      label: 'Message',
      type: 'text',
      required: true,
      placeholder: 'Enter message...',
    },
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

export default ContaForm;