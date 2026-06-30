/**
 * FormGenerator tests — verifies forms follow the canonical Archbase V3 pattern.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FormGenerator } from '../../src/generators/FormGenerator';
import { makeTempDir, cleanupDir, readGenerated, expectV3Imports } from '../helpers';
import * as path from 'path';

function baseConfig(output: string, overrides: Record<string, any> = {}) {
  return {
    fields: 'name:text,email:email,age:number',
    validation: 'yup',
    template: 'basic',
    output,
    typescript: true,
    test: false,
    story: false,
    ...overrides,
  } as any;
}

describe('FormGenerator', () => {
  let generator: FormGenerator;
  let tempDir: string;

  beforeEach(async () => {
    generator = new FormGenerator();
    tempDir = await makeTempDir();
  });

  afterEach(async () => {
    await cleanupDir(tempDir);
  });

  it('generates a form file successfully', async () => {
    const result = await generator.generate('CustomerForm', baseConfig(tempDir));
    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(1);
    expect(result.files[0]).toMatch(/CustomerForm\.tsx$/);
  });

  it('uses the canonical ArchbaseFormTemplate + DataSource pattern', async () => {
    const result = await generator.generate('CustomerForm', baseConfig(tempDir));
    const content = await readGenerated(result.files[0]);

    expect(content).toContain('ArchbaseFormTemplate');
    expect(content).toContain('useArchbaseRemoteDataSource');
    expect(content).toContain('dataSource={dataSource}');
    // No longer uses the non-existent FormBuilder component
    expect(content).not.toContain('FormBuilder');
  });

  it('emits @archbase/* imports and never the legacy monolith', async () => {
    const result = await generator.generate('CustomerForm', baseConfig(tempDir));
    const content = await readGenerated(result.files[0]);

    expectV3Imports(content);
    expect(content).toContain("from '@archbase/components'");
    expect(content).toContain("from '@archbase/template'");
    expect(content).toContain("from '@archbase/data'");
  });

  it('maps field types to the correct Archbase input components', async () => {
    const result = await generator.generate('MixedForm', baseConfig(tempDir, {
      fields: 'title:text,price:number,bio:textarea,active:boolean',
    }));
    const content = await readGenerated(result.files[0]);

    expect(content).toContain('ArchbaseEdit');
    expect(content).toContain('ArchbaseNumberEdit');
    expect(content).toContain('ArchbaseTextArea');
    expect(content).toContain('ArchbaseSwitch');
    expect(content).toContain('dataField="price"');
  });

  it('binds every field to a dataField', async () => {
    const result = await generator.generate('CustomerForm', baseConfig(tempDir));
    const content = await readGenerated(result.files[0]);
    expect(content).toContain('dataField="name"');
    expect(content).toContain('dataField="email"');
    expect(content).toContain('dataField="age"');
  });

  it('falls back to default fields when none provided', async () => {
    const result = await generator.generate('EmptyForm', baseConfig(tempDir, { fields: undefined }));
    expect(result.success).toBe(true);
    const content = await readGenerated(result.files[0]);
    expect(content).toContain('ArchbaseFormTemplate');
  });

  it('reports errors via the result object instead of throwing', async () => {
    // Invalid output path under a file, forcing a write failure.
    const filePath = path.join(tempDir, 'afile');
    const fs = await import('fs-extra');
    await fs.writeFile(filePath, 'x');
    const result = await generator.generate('BadForm', baseConfig(path.join(filePath, 'nested')));
    expect(result.success).toBe(false);
    expect(result.errors && result.errors.length).toBeGreaterThan(0);
  });

  it('renders enum fields as ArchbaseSelect over the enum values', async () => {
    const result = await generator.generate('ProductForm', baseConfig(tempDir, {
      fields: 'name:text,status:enum:ATIVO|INATIVO',
      validation: 'none',
    }));
    const content = await readGenerated(result.files[0]);
    expectV3Imports(content);
    // Imports the generated enum and binds the select to it.
    expect(content).toContain("import { ProductStatus } from '../../domain/ProductStatus';");
    expect(content).toContain('<ArchbaseSelect<ProductDto, ProductStatus, ProductStatus>');
    expect(content).toContain('{Object.values(ProductStatus).map((option) => (');
    expect(content).toContain('<ArchbaseSelectItem key={option} value={option} label={option} />');
    expect(content).toMatch(/import \{[\s\S]*ArchbaseSelect[\s\S]*\} from '@archbase\/components'/);
  });

  it('honors required flags and emits valid view/edit bindings (no fabricated readOnly prop)', async () => {
    const result = await generator.generate('ProductForm', baseConfig(tempDir, {
      fields: 'email!:email,note:textarea',
      validation: 'none',
    }));
    const content = await readGenerated(result.files[0]);
    // The `!` required-suffix is stripped from the field name (matches the DTO property).
    expect(content).toContain('dataField="email"');
    expect(content).not.toContain('dataField="email!"');
    // ArchbaseFormTemplate has no readOnly prop; VIEW mode disables each editor instead.
    expect(content).not.toContain('readOnly');
    expect(content).toContain('disabled={isViewing}');
    // EDIT puts the loaded record into edit mode so changes are accepted.
    expect(content).toContain('ds.edit();');
    // Optional field (no :required) does not get a required attribute.
    const noteIdx = content.indexOf('dataField="note"');
    expect(content.slice(noteIdx, content.indexOf('/>', noteIdx))).not.toContain('required');
  });

  it('generates a controlled modal form from the modal template', async () => {
    const result = await generator.generate('ProductFormModal', baseConfig(tempDir, {
      fields: 'name:text,status:enum:ATIVO|INATIVO',
      validation: 'none',
      template: 'modal',
    }));
    const content = await readGenerated(result.files[0]);
    // Controlled child: FormModalTemplate driven by a dataSource prop the parent owns.
    expect(content).toContain('ArchbaseFormModalTemplate<ProductDto, string>');
    expect(content).toContain('export interface ProductFormModalProps');
    expect(content).toContain('dataSource: ArchbaseDataSource<ProductDto, string>;');
    expect(content).toContain('export function ProductFormModal({ opened, dataSource, onClose, onSave }');
    // entityName is stripped of the FormModal suffix (not "ProductFormModal").
    expect(content).toContain("import { ProductDto } from '../../domain/ProductDto';");
    expect(content).not.toContain('ProductFormModalDto');
    // Field rendering comes from the shared partial (enum select included).
    expect(content).toContain('{Object.values(ProductStatus).map((option) => (');
    // The modal does not own a remote datasource (that's the page form's job).
    expect(content).not.toContain('useArchbaseRemoteDataSource');
  });
});
