/**
 * KnowledgeBase Tests
 * 
 * Test suite for the KnowledgeBase class to ensure proper
 * component information storage and retrieval.
 */

import { KnowledgeBase } from '../../src/knowledge/KnowledgeBase';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('KnowledgeBase', () => {
  let knowledgeBase: KnowledgeBase;
  let tempDir: string;

  beforeEach(async () => {
    // Create temporary directory for test knowledge base
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'archbase-kb-test-'));
    knowledgeBase = new KnowledgeBase(tempDir);
  });

  afterEach(async () => {
    // Clean up temporary directory
    await fs.remove(tempDir);
  });

  describe('component retrieval', () => {
    it('should return default components when no knowledge file exists', async () => {
      const component = await knowledgeBase.getComponent('ArchbaseEdit');

      expect(component).toBeDefined();
      expect(component!.name).toBe('ArchbaseEdit');
      expect(component!.description).toContain('Text input component');
      expect(component!.props.dataSource).toBeDefined();
      expect(component!.props.dataField).toBeDefined();
    });

    it('should return FormBuilder component', async () => {
      const component = await knowledgeBase.getComponent('FormBuilder');

      expect(component).toBeDefined();
      expect(component!.name).toBe('FormBuilder');
      expect(component!.description).toContain('Dynamic form generator');
      expect(component!.props.fields).toBeDefined();
      expect(component!.props.onSubmit).toBeDefined();
    });

    it('should return ArchbaseDataTable component', async () => {
      const component = await knowledgeBase.getComponent('ArchbaseDataTable');

      expect(component).toBeDefined();
      expect(component!.name).toBe('ArchbaseDataTable');
      expect(component!.description).toContain('Advanced data table');
      expect(component!.props.dataSource).toBeDefined();
      expect(component!.props.columns).toBeDefined();
    });

    it('should return null for non-existent component', async () => {
      const component = await knowledgeBase.getComponent('NonExistentComponent');

      expect(component).toBeNull();
    });

    it('should handle case-insensitive search', async () => {
      const component = await knowledgeBase.getComponent('archbaseedit');

      expect(component).toBeDefined();
      expect(component!.name).toBe('ArchbaseEdit');
    });
  });

  describe('pattern search', () => {
    it('should find CRUD patterns', async () => {
      const patterns = await knowledgeBase.searchPatterns('crud');

      expect(patterns).toHaveLength(1);
      expect(patterns[0].title).toBe('CRUD with validation');
      expect(patterns[0].components).toContain('ArchbaseEdit');
      expect(patterns[0].components).toContain('ArchbaseDataTable');
    });

    it('should find validation patterns', async () => {
      const patterns = await knowledgeBase.searchPatterns('validation');

      expect(patterns).toHaveLength(1);
      expect(patterns[0].title).toBe('CRUD with validation');
      expect(patterns[0].description).toContain('form validation');
    });

    it('should find table patterns', async () => {
      const patterns = await knowledgeBase.searchPatterns('table');

      expect(patterns).toHaveLength(1);
      expect(patterns[0].title).toBe('Data table with filters');
      expect(patterns[0].components).toContain('ArchbaseDataTable');
    });

    it('should return empty array for non-matching patterns', async () => {
      const patterns = await knowledgeBase.searchPatterns('nonexistent');

      expect(patterns).toHaveLength(0);
    });

    it('should filter patterns by category', async () => {
      const patterns = await knowledgeBase.searchPatterns('crud', 'forms');

      // Should find the pattern but filtered by category
      expect(patterns).toHaveLength(0); // Since our default patterns don't have 'forms' in tags
    });
  });

  describe('examples search', () => {
    it('should find examples by component', async () => {
      const examples = await knowledgeBase.searchExamples({ component: 'ArchbaseEdit' });

      expect(examples).toHaveLength(1);
      expect(examples[0].title).toBe('Basic text input');
      expect(examples[0].tags).toContain('basic');
    });

    it('should find examples by tag', async () => {
      const examples = await knowledgeBase.searchExamples({ tag: 'form' });

      expect(examples.length).toBeGreaterThan(0);
      const example = examples.find(e => e.tags.includes('form'));
      expect(example).toBeDefined();
    });

    it('should return empty array when no examples match', async () => {
      const examples = await knowledgeBase.searchExamples({ component: 'NonExistentComponent' });

      expect(examples).toHaveLength(0);
    });
  });

  describe('free search', () => {
    it('should find components by search query', async () => {
      const results = await knowledgeBase.freeSearch('form builder');

      expect(results.components.length).toBeGreaterThan(0);
      const formBuilder = results.components.find(c => c.name === 'FormBuilder');
      expect(formBuilder).toBeDefined();
    });

    it('should find patterns by search query', async () => {
      const results = await knowledgeBase.freeSearch('data table filtering');

      expect(results.patterns.length).toBeGreaterThan(0);
      const tablePattern = results.patterns.find(p => p.title === 'Data table with filters');
      expect(tablePattern).toBeDefined();
    });

    it('should return comprehensive results', async () => {
      const results = await knowledgeBase.freeSearch('validation');

      expect(results.components).toBeInstanceOf(Array);
      expect(results.patterns).toBeInstanceOf(Array);
      expect(results.examples).toBeInstanceOf(Array);
    });

    it('should handle empty search query', async () => {
      const results = await knowledgeBase.freeSearch('');

      expect(results.components).toHaveLength(0);
      expect(results.patterns).toHaveLength(0);
      expect(results.examples).toHaveLength(0);
    });
  });

  describe('custom knowledge loading', () => {
    it('should load custom components from file', async () => {
      // Create custom knowledge file
      const customComponents = {
        components: {
          'CustomComponent': {
            name: 'CustomComponent',
            description: 'A custom test component',
            category: 'custom',
            version: '1.0.0',
            status: 'stable',
            props: {
              customProp: {
                type: 'string',
                required: true,
                description: 'A custom property'
              }
            },
            examples: [],
            patterns: [],
            relatedComponents: [],
            dependencies: [],
            complexity: 'low',
            useCases: ['testing']
          }
        }
      };

      await fs.writeJson(path.join(tempDir, 'components.json'), customComponents);

      // Create new knowledge base instance to load the custom file
      const customKB = new KnowledgeBase(tempDir);
      const component = await customKB.getComponent('CustomComponent');

      expect(component).toBeDefined();
      expect(component!.name).toBe('CustomComponent');
      expect(component!.description).toBe('A custom test component');
      expect(component!.props.customProp).toBeDefined();
    });

    it('should load custom patterns from file', async () => {
      // Create custom patterns file
      const customPatterns = {
        patterns: {
          'custom-pattern': {
            name: 'custom-pattern',
            title: 'Custom Pattern',
            description: 'A custom test pattern',
            components: ['CustomComponent'],
            template: 'custom.hbs',
            examples: [],
            complexity: 'low',
            tags: ['custom', 'test']
          }
        }
      };

      await fs.writeJson(path.join(tempDir, 'patterns.json'), customPatterns);

      // Create new knowledge base instance to load the custom file
      const customKB = new KnowledgeBase(tempDir);
      const patterns = await customKB.searchPatterns('custom');

      expect(patterns).toHaveLength(1);
      expect(patterns[0].title).toBe('Custom Pattern');
      expect(patterns[0].tags).toContain('custom');
    });

    it('should handle corrupted knowledge files gracefully', async () => {
      // Create corrupted JSON file
      await fs.writeFile(path.join(tempDir, 'components.json'), '{ invalid json');

      // Should fall back to default components
      const component = await knowledgeBase.getComponent('ArchbaseEdit');

      expect(component).toBeDefined();
      expect(component!.name).toBe('ArchbaseEdit');
    });
  });

  describe('AI hints and context', () => {
    it('should provide AI hints for components', async () => {
      const component = await knowledgeBase.getComponent('ArchbaseEdit');

      expect(component!.aiHints).toBeDefined();
      expect(component!.aiHints!.length).toBeGreaterThan(0);
      expect(component!.aiHints![0]).toContain('onChangeValue');
    });

    it('should provide AI hints for FormBuilder', async () => {
      const component = await knowledgeBase.getComponent('FormBuilder');

      expect(component!.aiHints).toBeDefined();
      expect(component!.aiHints!.length).toBeGreaterThan(0);
      expect(component!.aiHints![0]).toContain('FieldConfig');
    });

    it('should include complexity information', async () => {
      const component = await knowledgeBase.getComponent('ArchbaseEdit');

      expect(component!.complexity).toBe('low');

      const formBuilder = await knowledgeBase.getComponent('FormBuilder');
      expect(formBuilder!.complexity).toBe('medium');
    });

    it('should include use cases', async () => {
      const component = await knowledgeBase.getComponent('ArchbaseEdit');

      expect(component!.useCases).toContain('forms');
      expect(component!.useCases).toContain('data entry');
    });
  });
});