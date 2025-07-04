import React, { useState } from 'react';
import {
  ArchbaseRichTextEdit,
  useArchbaseRemoteDataSource
} from 'archbase-react';
import { Stack, Button, Group, TextInput, Select } from '@mantine/core';

interface ArticleDto {
  id?: string;
  title: string;
  content: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: Date;
}

export function RichTextArticleExample() {
  const dataSource = useArchbaseRemoteDataSource<ArticleDto, string>({
    name: 'articles',
    endPointUrl: '/api/articles',
    inserting: true
  });

  const [previewMode, setPreviewMode] = useState(false);

  const categoryOptions = [
    { value: 'tech', label: 'Tecnologia' },
    { value: 'business', label: 'Negócios' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'news', label: 'Notícias' }
  ];

  const statusOptions = [
    { value: 'DRAFT', label: 'Rascunho' },
    { value: 'PUBLISHED', label: 'Publicado' },
    { value: 'ARCHIVED', label: 'Arquivado' }
  ];

  // Custom upload handler for images
  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      const article = dataSource.getCurrentRecord();
      if (!article?.title || !article?.content) {
        alert('Título e conteúdo são obrigatórios');
        return;
      }

      await dataSource.save();
      console.log('Article saved successfully');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handlePublish = async () => {
    try {
      dataSource.setFieldValue('status', 'PUBLISHED');
      dataSource.setFieldValue('publishedAt', new Date());
      await dataSource.save();
      console.log('Article published successfully');
    } catch (error) {
      console.error('Publish error:', error);
    }
  };

  return (
    <Stack spacing="md">
      <Group grow>
        <TextInput
          label="Título do Artigo"
          placeholder="Digite o título..."
          dataSource={dataSource}
          dataField="title"
          required
        />
        <Select
          label="Categoria"
          placeholder="Selecione uma categoria"
          data={categoryOptions}
          dataSource={dataSource}
          dataField="category"
        />
        <Select
          label="Status"
          data={statusOptions}
          dataSource={dataSource}
          dataField="status"
        />
      </Group>

      <div>
        <Group mb="sm">
          <Button
            variant={previewMode ? 'subtle' : 'filled'}
            onClick={() => setPreviewMode(false)}
          >
            Editor
          </Button>
          <Button
            variant={previewMode ? 'filled' : 'subtle'}
            onClick={() => setPreviewMode(true)}
          >
            Preview
          </Button>
        </Group>

        {!previewMode ? (
          <ArchbaseRichTextEdit
            dataSource={dataSource}
            dataField="content"
            height="500px"
            placeholder="Comece a escrever seu artigo..."
            defaultStyle="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;"
            onImageUploadBefore={async (files, info, uploadHandler) => {
              try {
                const file = files[0];
                const imageUrl = await handleImageUpload(file);
                uploadHandler([{ name: file.name, size: file.size, result: imageUrl }]);
              } catch (error) {
                console.error('Image upload error:', error);
              }
            }}
            setOptions={{
              buttonList: [
                ['undo', 'redo'],
                ['font', 'fontSize', 'formatBlock'],
                ['paragraphStyle', 'blockquote'],
                ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                ['fontColor', 'hiliteColor', 'textStyle'],
                ['removeFormat'],
                ['outdent', 'indent'],
                ['align', 'horizontalRule', 'list', 'lineHeight'],
                ['table', 'link', 'image', 'video'],
                ['fullScreen', 'showBlocks', 'codeView'],
                ['preview', 'print']
              ],
              formats: ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
              font: ['Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Georgia', 'Tahoma', 'Trebuchet MS', 'Verdana'],
              fontSize: [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]
            }}
          />
        ) : (
          <div 
            style={{ 
              border: '1px solid #e9ecef',
              borderRadius: '4px',
              padding: '16px',
              minHeight: '500px',
              backgroundColor: '#fff'
            }}
            dangerouslySetInnerHTML={{ __html: dataSource.getFieldValue('content') || '' }}
          />
        )}
      </div>

      <Group position="right">
        <Button variant="subtle">
          Cancelar
        </Button>
        <Button variant="outline" onClick={handleSave}>
          Salvar Rascunho
        </Button>
        <Button onClick={handlePublish}>
          Publicar
        </Button>
      </Group>
    </Stack>
  );
}

// Example with custom toolbar
export function RichTextCustomToolbarExample() {
  return (
    <ArchbaseRichTextEdit
      placeholder="Editor com toolbar customizada..."
      height="400px"
      setOptions={{
        buttonList: [
          ['bold', 'italic', 'underline'],
          ['fontColor', 'hiliteColor'],
          ['align'],
          ['list'],
          ['link', 'image'],
          ['fullScreen']
        ],
        fontSize: [12, 14, 16, 18, 20],
        colorList: [
          '#000000', '#333333', '#666666', '#999999', '#cccccc',
          '#ff0000', '#ff6600', '#ffcc00', '#33cc33', '#0066cc', '#6600cc'
        ]
      }}
    />
  );
}