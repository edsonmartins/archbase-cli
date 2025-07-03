/**
 * ComponentGenerator Tests
 * 
 * Test suite for the ComponentGenerator class to ensure generated components
 * are syntactically correct and follow expected patterns.
 */

import { ComponentGenerator } from '../../src/generators/ComponentGenerator';
import { CodeValidator } from '../../src/validators/CodeValidator';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('ComponentGenerator', () => {
  let generator: ComponentGenerator;
  let validator: CodeValidator;
  let tempDir: string;

  beforeEach(async () => {
    generator = new ComponentGenerator();
    validator = new CodeValidator();
    
    // Create temporary directory for test outputs
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'archbase-cli-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    await fs.remove(tempDir);
  });

  describe('display components', () => {
    it('should generate a valid display component', async () => {
      const config = {
        type: 'display',
        name: 'UserCard',
        props: 'name:string,avatar:string,isOnline:boolean=false',
        outputDir: tempDir,
        typescript: true,
        withState: false,
        withEffects: false,
        withMemo: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('UserCard', config);

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(1);
      expect(result.files[0]).toMatch(/UserCard\.tsx$/);

      // Validate generated code
      const validationResult = await validator.validateFile(result.files[0]);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
    });

    it('should generate display component with correct props interface', async () => {
      const config = {
        type: 'display',
        name: 'ProductCard',
        props: 'title:string,price:number,image:string',
        outputDir: tempDir,
        typescript: true,
        withState: false,
        withEffects: false,
        withMemo: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('ProductCard', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      // Check interface definition
      expect(content).toMatch(/interface ProductCardProps/);
      expect(content).toMatch(/title:\s*string/);
      expect(content).toMatch(/price:\s*number/);
      expect(content).toMatch(/image:\s*string/);

      // Check component definition
      expect(content).toMatch(/const ProductCard:\s*React\.FC<ProductCardProps>/);
      expect(content).toMatch(/export default ProductCard/);
    });
  });

  describe('input components', () => {
    it('should generate input component with state', async () => {
      const config = {
        type: 'input',
        name: 'CustomInput',
        props: 'value:string,onChange:function',
        outputDir: tempDir,
        typescript: true,
        withState: true,
        withEffects: false,
        withMemo: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('CustomInput', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      // Check useState import
      expect(content).toMatch(/import React, \{ useState \}/);

      // Check state usage
      expect(content).toMatch(/useState/);

      // Validate generated code
      const validationResult = await validator.validateCode(content);
      expect(validationResult.isValid).toBe(true);
    });
  });

  describe('functional components', () => {
    it('should generate functional component with effects', async () => {
      const config = {
        type: 'functional',
        name: 'DataProcessor',
        props: 'data:object[],onProcess:function',
        outputDir: tempDir,
        typescript: true,
        withState: false,
        withEffects: true,
        withMemo: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('DataProcessor', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      // Check useEffect import
      expect(content).toMatch(/import React, \{ useEffect \}/);

      // Check useEffect usage
      expect(content).toMatch(/useEffect\(\(\) => \{/);

      // Validate generated code
      const validationResult = await validator.validateCode(content);
      expect(validationResult.isValid).toBe(true);
    });

    it('should generate functional component with memo', async () => {
      const config = {
        type: 'functional',
        name: 'MemoComponent',
        props: 'data:object[],config:object',
        outputDir: tempDir,
        typescript: true,
        withState: false,
        withEffects: false,
        withMemo: true,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('MemoComponent', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      // Check memo imports
      expect(content).toMatch(/import React, \{ useMemo, useCallback \}/);

      // Check memo usage
      expect(content).toMatch(/useMemo/);

      // Validate generated code
      const validationResult = await validator.validateCode(content);
      expect(validationResult.isValid).toBe(true);
    });
  });

  describe('layout components', () => {
    it('should generate layout component', async () => {
      const config = {
        type: 'layout',
        name: 'PageLayout',
        props: 'children:node,title:string',
        outputDir: tempDir,
        typescript: true,
        withState: false,
        withEffects: false,
        withMemo: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('PageLayout', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      // Check children prop handling
      expect(content).toMatch(/children:\s*React\.ReactNode/);

      // Validate generated code
      const validationResult = await validator.validateCode(content);
      expect(validationResult.isValid).toBe(true);
    });
  });

  describe('props parsing', () => {
    it('should parse simple props correctly', async () => {
      const config = {
        type: 'display',
        name: 'SimpleComponent',
        props: 'title:string,count:number',
        outputDir: tempDir,
        typescript: true,
        withState: false,
        withEffects: false,
        withMemo: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('SimpleComponent', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      expect(content).toMatch(/title:\s*string/);
      expect(content).toMatch(/count:\s*number/);
    });

    it('should parse props with default values', async () => {
      const config = {
        type: 'display',
        name: 'DefaultComponent',
        props: 'title:string,visible:boolean=true,count:number=0',
        outputDir: tempDir,
        typescript: true,
        withState: false,
        withEffects: false,
        withMemo: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('DefaultComponent', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      expect(content).toMatch(/visible:\s*boolean/);
      expect(content).toMatch(/count:\s*number/);
    });

    it('should handle optional props', async () => {
      const config = {
        type: 'display',
        name: 'OptionalComponent',
        props: 'title:string,description?:string',
        outputDir: tempDir,
        typescript: true,
        withState: false,
        withEffects: false,
        withMemo: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('OptionalComponent', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      expect(content).toMatch(/title:\s*string/);
      expect(content).toMatch(/description\?\s*:\s*string/);
    });
  });

  describe('imports and dependencies', () => {
    it('should include correct React imports', async () => {
      const config = {
        type: 'display',
        name: 'TestComponent',
        props: 'title:string',
        outputDir: tempDir,
        typescript: true,
        withState: false,
        withEffects: false,
        withMemo: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('TestComponent', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      // Check React import (should be just React for display components without hooks)
      expect(content).toMatch(/import React from ['"]react['"]/);
    });

    it('should include correct React imports with hooks', async () => {
      const config = {
        type: 'functional',
        name: 'HookComponent',
        props: 'data:object[]',
        outputDir: tempDir,
        typescript: true,
        withState: true,
        withEffects: true,
        withMemo: true,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('HookComponent', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      // Check React imports with hooks
      expect(content).toMatch(/import React, \{ useState, useEffect, useMemo, useCallback \}/);
    });

    it('should include Archbase imports for display components', async () => {
      const config = {
        type: 'display',
        name: 'ArchbaseComponent',
        props: 'title:string',
        outputDir: tempDir,
        typescript: true,
        withState: false,
        withEffects: false,
        withMemo: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('ArchbaseComponent', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      // Check Archbase imports
      expect(content).toMatch(/import.*ArchbaseCard.*from ['"]@archbase\/react['"]/);
    });
  });

  describe('error handling', () => {
    it('should handle invalid component type gracefully', async () => {
      const config = {
        type: 'invalid-type',
        name: 'InvalidComponent',
        props: 'title:string',
        outputDir: tempDir,
        typescript: true,
        withState: false,
        withEffects: false,
        withMemo: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('InvalidComponent', config);

      // Should fall back to display type
      expect(result.success).toBe(true);
      
      const content = await fs.readFile(result.files[0], 'utf-8');
      const validationResult = await validator.validateCode(content);
      expect(validationResult.isValid).toBe(true);
    });

    it('should handle empty props gracefully', async () => {
      const config = {
        type: 'display',
        name: 'EmptyPropsComponent',
        props: '',
        outputDir: tempDir,
        typescript: true,
        withState: false,
        withEffects: false,
        withMemo: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('EmptyPropsComponent', config);

      expect(result.success).toBe(true);
      
      const content = await fs.readFile(result.files[0], 'utf-8');
      
      // Should have empty props interface
      expect(content).toMatch(/interface EmptyPropsComponentProps \{\s*\}/);
      
      const validationResult = await validator.validateCode(content);
      expect(validationResult.isValid).toBe(true);
    });
  });

  describe('code quality', () => {
    it('should generate components with proper TypeScript types', async () => {
      const config = {
        type: 'display',
        name: 'TypedComponent',
        props: 'title:string,count:number,active:boolean,data:object,items:string[]',
        outputDir: tempDir,
        typescript: true,
        withState: false,
        withEffects: false,
        withMemo: false,
        withTests: false,
        withStories: false
      };

      const result = await generator.generate('TypedComponent', config);
      const content = await fs.readFile(result.files[0], 'utf-8');

      expect(content).toMatch(/title:\s*string/);
      expect(content).toMatch(/count:\s*number/);
      expect(content).toMatch(/active:\s*boolean/);
      expect(content).toMatch(/data:\s*object/);
      expect(content).toMatch(/items:\s*string\[\]/);

      const validationResult = await validator.validateCode(content);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.metrics.hasTypeScript).toBe(true);
    });
  });
});