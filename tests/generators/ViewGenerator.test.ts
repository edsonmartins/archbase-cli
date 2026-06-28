/**
 * ViewGenerator tests — canonical ArchbaseGridTemplate + security provider view.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ViewGenerator } from '../../src/generators/ViewGenerator';
import { makeTempDir, cleanupDir, readGenerated, expectV3Imports } from '../helpers';

function config(output: string, overrides: Record<string, any> = {}) {
  return {
    fields: 'name:text,price:number,active:boolean',
    output,
    typescript: true,
    test: false,
    story: false,
    feature: 'product',
    withPermissions: true,
    withFilters: true,
    withPagination: true,
    withSorting: true,
    ...overrides,
  } as any;
}

describe('ViewGenerator', () => {
  let generator: ViewGenerator;
  let tempDir: string;

  beforeEach(async () => {
    generator = new ViewGenerator();
    tempDir = await makeTempDir();
  });
  afterEach(async () => {
    await cleanupDir(tempDir);
  });

  it('generates a CRUD view file', async () => {
    const result = await generator.generate('ProductView', config(tempDir));
    expect(result.success).toBe(true);
    expect(result.files[0]).toMatch(/ProductView\.tsx$/);
  });

  it('uses the canonical grid template and security provider', async () => {
    const result = await generator.generate('ProductView', config(tempDir));
    const content = await readGenerated(result.files[0]);
    expect(content).toContain('ArchbaseGridTemplate');
    expect(content).toContain('ArchbaseViewSecurityProvider');
    expect(content).toContain('Columns');
    expect(content).toContain('ArchbaseDataGridColumn');
  });

  it('emits @archbase/* imports and no legacy monolith / broken project-name import', async () => {
    const result = await generator.generate('ProductView', config(tempDir));
    const content = await readGenerated(result.files[0]);
    expectV3Imports(content);
    expect(content).toContain("from '@archbase/template'");
    expect(content).toContain("from '@archbase/data'");
    // The old broken `{{pascalCase projectName}}IOCTypes` import is replaced
    // by a stable relative IOC import.
    expect(content).toContain("from '../../ioc/IOCTypes'");
  });

  it('renders a column per field', async () => {
    const result = await generator.generate('ProductView', config(tempDir));
    const content = await readGenerated(result.files[0]);
    expect(content).toContain('dataField="name"');
    expect(content).toContain('dataField="price"');
    expect(content).toContain('dataField="active"');
  });
});
