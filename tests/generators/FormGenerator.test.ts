/**
 * FormGenerator Tests
 * 
 * Test suite for the FormGenerator class to ensure generated forms
 * are syntactically correct and follow expected patterns.
 */

import { FormGenerator } from '../../src/generators/FormGenerator';
import { CodeValidator } from '../../src/validators/CodeValidator';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('FormGenerator', () => {
  let generator: FormGenerator;
  let validator: CodeValidator;
  let tempDir: string;

  beforeEach(async () => {
    generator = new FormGenerator();
    validator = new CodeValidator();
    
    // Create temporary directory for test outputs
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'archbase-cli-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    await fs.remove(tempDir);
  });

  describe('basic form generation', () => {
    it('should generate a valid basic form', async () => {
      const config = {
        name: 'UserForm',
        fields: [
          { name: 'name', type: 'string', label: 'Name', required: true },
          { name: 'email', type: 'email', label: 'Email', required: true },
          { name: 'age', type: 'number', label: 'Age', required: false }
        ],
        outputDir: tempDir,
        template: 'basic',
        typescript: true,
        withValidation: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('UserForm', config);

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(1);
      expect(result.files[0]).toMatch(/UserForm\.tsx$/);

      // Validate generated code
      const generatedFile = result.files[0];
      const validationResult = await validator.validateFile(generatedFile);

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
    });

    it('should generate form with correct props interface', async () => {
      const config = {
        name: 'ProductForm',
        fields: [
          { name: 'title', type: 'string', label: 'Title', required: true },
          { name: 'price', type: 'number', label: 'Price', required: true },
          { name: 'active', type: 'boolean', label: 'Active', required: false }
        ],
        outputDir: tempDir,
        template: 'basic',
        typescript: true,
        withValidation: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('ProductForm', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      // Check interface definition
      expect(content).toMatch(/interface ProductFormProps/);
      expect(content).toMatch(/onSubmit:\s*\(values:\s*Product\)\s*=>\s*Promise<void>/);
      expect(content).toMatch(/initialValues\?\s*:\s*Partial<Product>/);

      // Check Product interface
      expect(content).toMatch(/interface Product/);
      expect(content).toMatch(/title:\s*string/);
      expect(content).toMatch(/price:\s*number/);
      expect(content).toMatch(/active:\s*boolean/);
    });
  });

  describe('form with validation', () => {
    it('should generate form with Yup validation', async () => {
      const config = {
        name: 'RegisterForm',
        fields: [
          { name: 'username', type: 'string', label: 'Username', required: true },
          { name: 'email', type: 'email', label: 'Email', required: true },
          { name: 'password', type: 'password', label: 'Password', required: true }
        ],
        outputDir: tempDir,
        template: 'validation',
        validation: 'yup',
        typescript: true,
        withValidation: true,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('RegisterForm', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      // Check Yup import
      expect(content).toMatch(/import.*yup.*from\s+['"]yup['"]/);

      // Check validation schema
      expect(content).toMatch(/const validationSchema = yup\.object/);
      expect(content).toMatch(/username:\s*yup\.string\(\)\.required\(\)/);
      expect(content).toMatch(/email:\s*yup\.string\(\)\.email\(\)\.required\(\)/);
      expect(content).toMatch(/password:\s*yup\.string\(\)\.min\(/);

      // Validate generated code
      const validationResult = await validator.validateCode(content);
      expect(validationResult.isValid).toBe(true);
    });

    it('should generate form with Zod validation', async () => {
      const config = {
        name: 'LoginForm',
        fields: [
          { name: 'email', type: 'email', label: 'Email', required: true },
          { name: 'password', type: 'password', label: 'Password', required: true }
        ],
        outputDir: tempDir,
        template: 'validation',
        validation: 'zod',
        typescript: true,
        withValidation: true,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('LoginForm', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      // Check Zod import
      expect(content).toMatch(/import.*z.*from\s+['"]zod['"]/);

      // Check validation schema
      expect(content).toMatch(/const validationSchema = z\.object/);
      expect(content).toMatch(/email:\s*z\.string\(\)\.email\(\)/);
      expect(content).toMatch(/password:\s*z\.string\(\)\.min\(/);

      // Validate generated code
      const validationResult = await validator.validateCode(content);
      expect(validationResult.isValid).toBe(true);
    });
  });

  describe('field types handling', () => {
    it('should handle all supported field types', async () => {
      const config = {
        name: 'ComplexForm',
        fields: [
          { name: 'text', type: 'string', label: 'Text Field' },
          { name: 'email', type: 'email', label: 'Email Field' },
          { name: 'password', type: 'password', label: 'Password Field' },
          { name: 'number', type: 'number', label: 'Number Field' },
          { name: 'boolean', type: 'boolean', label: 'Boolean Field' },
          { name: 'date', type: 'date', label: 'Date Field' },
          { name: 'select', type: 'select', label: 'Select Field', options: ['option1', 'option2'] },
          { name: 'textarea', type: 'textarea', label: 'Textarea Field' }
        ],
        outputDir: tempDir,
        template: 'basic',
        typescript: true,
        withValidation: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('ComplexForm', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      // Check field configurations are present
      expect(content).toMatch(/name:\s*['"]text['"]/);
      expect(content).toMatch(/type:\s*['"]text['"]/);
      expect(content).toMatch(/name:\s*['"]email['"]/);
      expect(content).toMatch(/type:\s*['"]email['"]/);
      expect(content).toMatch(/name:\s*['"]password['"]/);
      expect(content).toMatch(/type:\s*['"]password['"]/);
      expect(content).toMatch(/name:\s*['"]number['"]/);
      expect(content).toMatch(/type:\s*['"]number['"]/);

      // Validate generated code
      const validationResult = await validator.validateCode(content);
      expect(validationResult.isValid).toBe(true);
    });

    it('should handle field options for select fields', async () => {
      const config = {
        name: 'SelectForm',
        fields: [
          { 
            name: 'category', 
            type: 'select', 
            label: 'Category', 
            options: ['electronics', 'clothing', 'books'],
            required: true 
          }
        ],
        outputDir: tempDir,
        template: 'basic',
        typescript: true,
        withValidation: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('SelectForm', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      // Check options are included
      expect(content).toMatch(/options:\s*\[.*electronics.*clothing.*books.*\]/);

      // Validate generated code
      const validationResult = await validator.validateCode(content);
      expect(validationResult.isValid).toBe(true);
    });
  });

  describe('template variations', () => {
    it('should generate wizard template', async () => {
      const config = {
        name: 'WizardForm',
        fields: [
          { name: 'step1Field', type: 'string', label: 'Step 1 Field' },
          { name: 'step2Field', type: 'string', label: 'Step 2 Field' }
        ],
        outputDir: tempDir,
        template: 'wizard',
        typescript: true,
        withValidation: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('WizardForm', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      // Check wizard-specific elements
      expect(content).toMatch(/useState.*currentStep/);
      expect(content).toMatch(/const nextStep/);
      expect(content).toMatch(/const prevStep/);

      // Validate generated code
      const validationResult = await validator.validateCode(content);
      expect(validationResult.isValid).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle invalid field types gracefully', async () => {
      const config = {
        name: 'InvalidForm',
        fields: [
          { name: 'invalidField', type: 'invalidType', label: 'Invalid Field' }
        ],
        outputDir: tempDir,
        template: 'basic',
        typescript: true,
        withValidation: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('InvalidForm', config);

      // Should still generate but with default field type
      expect(result.success).toBe(true);
      
      const content = await fs.readFile(result.files[0], 'utf-8');
      
      // Validate that code is still syntactically correct
      const validationResult = await validator.validateCode(content);
      expect(validationResult.isValid).toBe(true);
    });

    it('should handle empty fields array', async () => {
      const config = {
        name: 'EmptyForm',
        fields: [],
        outputDir: tempDir,
        template: 'basic',
        typescript: true,
        withValidation: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('EmptyForm', config);

      expect(result.success).toBe(true);
      
      const content = await fs.readFile(result.files[0], 'utf-8');
      
      // Should have empty fields array
      expect(content).toMatch(/const fields:\s*FieldConfig\[\]\s*=\s*\[\]/);
      
      // Validate generated code
      const validationResult = await validator.validateCode(content);
      expect(validationResult.isValid).toBe(true);
    });
  });

  describe('imports and dependencies', () => {
    it('should include correct Archbase imports', async () => {
      const config = {
        name: 'TestForm',
        fields: [
          { name: 'name', type: 'string', label: 'Name' }
        ],
        outputDir: tempDir,
        template: 'basic',
        typescript: true,
        withValidation: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('TestForm', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      // Check Archbase imports
      expect(content).toMatch(/import.*FormBuilder.*from\s+['"]@archbase\/react['"]/);
      expect(content).toMatch(/import.*FieldConfig.*from\s+['"]@archbase\/react['"]/);

      // Check React imports
      expect(content).toMatch(/import React.*from\s+['"]react['"]/);
    });
  });
});