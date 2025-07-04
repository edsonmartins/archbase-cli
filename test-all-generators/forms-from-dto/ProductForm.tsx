ArchbaseEdit
Button

interface ProductFormProps {
  onSubmit: (values: Product) => Promise<void>;
  
}

interface Product {
  message: text;
  data: text;
}

const validationSchema = yup.object({
  message: yup.string().required(),
  data: yup.string().required(),
});

const ProductForm: React.FC<ProductFormProps> = ({
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

export default ProductForm;