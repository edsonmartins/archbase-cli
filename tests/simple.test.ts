/**
 * Simple integration tests for Archbase CLI
 * 
 * Basic tests to ensure the main functionality works
 */

import { CodeValidator } from '../src/validators/CodeValidator';
import { KnowledgeBase } from '../src/knowledge/KnowledgeBase';

describe('Archbase CLI - Basic Functionality', () => {
  describe('CodeValidator', () => {
    let validator: CodeValidator;

    beforeEach(() => {
      validator = new CodeValidator();
    });

    it('should validate correct React component', async () => {
      const code = `
import React from 'react';

interface Props {
  title: string;
}

const TestComponent: React.FC<Props> = ({ title }) => {
  return <div>{title}</div>;
};

export default TestComponent;
      `;

      const result = validator.validateCode(code);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metrics.hasTypeScript).toBe(true);
    });

    it('should detect missing React import', async () => {
      const code = `
interface Props {
  title: string;
}

const TestComponent: React.FC<Props> = ({ title }) => {
  return <div>{title}</div>;
};

export default TestComponent;
      `;

      const result = validator.validateCode(code);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Missing React import');
    });

    it('should detect missing Archbase import', async () => {
      const code = `
import React from 'react';

interface Props {
  value: string;
}

const TestComponent: React.FC<Props> = ({ value }) => {
  return <ArchbaseEdit value={value} />;
};

export default TestComponent;
      `;

      const result = validator.validateCode(code);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Missing @archbase/react import');
    });

    it('should calculate metrics correctly', async () => {
      const code = `
import React, { useState } from 'react';

interface Props {
  title: string;
}

const TestComponent: React.FC<Props> = ({ title }) => {
  const [count, setCount] = useState(0);
  
  if (title) {
    return <div>{title}: {count}</div>;
  }
  
  return <div>No title</div>;
};

export default TestComponent;
      `;

      const result = validator.validateCode(code);

      expect(result.metrics.hasTypeScript).toBe(true);
      expect(result.metrics.complexity).toBeGreaterThan(1); // Has if statement
      expect(result.metrics.importCount).toBe(1);
    });
  });

  describe('KnowledgeBase', () => {
    let knowledgeBase: KnowledgeBase;

    beforeEach(() => {
      knowledgeBase = new KnowledgeBase();
    });

    it('should return ArchbaseEdit component information', async () => {
      const component = await knowledgeBase.getComponent('ArchbaseEdit');

      expect(component).toBeDefined();
      expect(component!.name).toBe('ArchbaseEdit');
      expect(component!.description).toContain('Text input component');
      expect(component!.props.dataSource).toBeDefined();
      expect(component!.props.dataField).toBeDefined();
    });

    it('should return FormBuilder component information', async () => {
      const component = await knowledgeBase.getComponent('FormBuilder');

      expect(component).toBeDefined();
      expect(component!.name).toBe('FormBuilder');
      expect(component!.description).toContain('Dynamic form generator');
      expect(component!.props.fields).toBeDefined();
      expect(component!.props.onSubmit).toBeDefined();
    });

    it('should return null for non-existent component', async () => {
      const component = await knowledgeBase.getComponent('NonExistentComponent');

      expect(component).toBeNull();
    });

    it('should find CRUD patterns', async () => {
      const patterns = await knowledgeBase.searchPatterns('crud');

      expect(patterns.length).toBeGreaterThan(0);
      const crudPattern = patterns.find(p => p.title.includes('CRUD'));
      expect(crudPattern).toBeDefined();
      expect(crudPattern!.components).toContain('ArchbaseEdit');
    });

    it('should perform free search', async () => {
      const results = await knowledgeBase.freeSearch('data table');

      expect(results.components).toBeInstanceOf(Array);
      expect(results.patterns).toBeInstanceOf(Array);
      expect(results.examples).toBeInstanceOf(Array);
    });
  });

  describe('Integration Tests', () => {
    it('should validate generated-like TypeScript component', async () => {
      const validator = new CodeValidator();
      
      // This simulates what our generators would produce
      const generatedCode = `
import React from 'react';
import { FormBuilder, FieldConfig } from '@archbase/react';

interface UserFormProps {
  onSubmit: (values: User) => Promise<void>;
  initialValues?: Partial<User>;
}

interface User {
  name: string;
  email: string;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, initialValues }) => {
  const fields: FieldConfig[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
  ];

  return (
    <FormBuilder
      fields={fields}
      onSubmit={onSubmit}
      initialValues={initialValues}
    />
  );
};

export default UserForm;
      `;

      const result = validator.validateCode(generatedCode);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metrics.hasTypeScript).toBe(true);
      expect(result.metrics.componentCount).toBe(0); // Functions aren't counted as components in our logic
    });

    it('should validate knowledge base integration with validator', async () => {
      const knowledgeBase = new KnowledgeBase();
      const validator = new CodeValidator();
      
      const component = await knowledgeBase.getComponent('FormBuilder');
      expect(component).toBeDefined();

      // Create code using the component information
      const code = `
import React from 'react';
import { FormBuilder } from '@archbase/react';

const TestForm: React.FC = () => {
  const fields = [
    { name: 'test', label: 'Test', type: 'text' }
  ];

  return (
    <FormBuilder 
      fields={fields}
      onSubmit={() => {}}
    />
  );
};

export default TestForm;
      `;

      const validationResult = validator.validateCode(code);
      expect(validationResult.isValid).toBe(true);
    });
  });
});