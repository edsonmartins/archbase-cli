/**
 * DashboardGenerator tests — verifies dashboard generation uses the correct
 * V3 (@archbase/*) imports. Note: generate() returns the dashboard source code
 * as a string and writes files under <outputPath>/dashboards/.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DashboardGenerator, DashboardGeneratorOptions } from '../../src/generators/DashboardGenerator';
import { makeTempDir, cleanupDir, listFiles, expectV3Imports } from '../helpers';

function baseOptions(outputPath: string, overrides: Partial<DashboardGeneratorOptions> = {}): DashboardGeneratorOptions {
  return {
    name: 'SalesDashboard',
    title: 'Sales Overview',
    layout: 'grid',
    outputPath,
    withNavigation: true,
    serviceIntegration: false,
    tables: [
      {
        id: 'salesTable',
        title: 'Recent Sales',
        dataSource: 'salesDataSource',
        // NOTE: number-type columns are intentionally avoided here — see the
        // dedicated test below documenting the grid.hbs `meta={{ isNumeric }}` bug.
        columns: [
          { field: 'product', title: 'Product', type: 'text' },
          { field: 'amount', title: 'Amount', type: 'text', sortable: true },
        ],
        pagination: true,
        searchable: true,
      },
    ],
    ...overrides,
  };
}

describe('DashboardGenerator', () => {
  let generator: DashboardGenerator;
  let tempDir: string;

  beforeEach(async () => {
    generator = new DashboardGenerator();
    tempDir = await makeTempDir();
  });

  afterEach(async () => {
    await cleanupDir(tempDir);
  });

  it('generates dashboard source code and writes the file', async () => {
    const code = await generator.generate(baseOptions(tempDir));

    expect(typeof code).toBe('string');
    expect(code).toContain('export function SalesDashboard');

    const files = await listFiles(tempDir);
    expect(files.some(f => f.endsWith('SalesDashboard.tsx'))).toBe(true);
  });

  it('imports ArchbaseDataGrid from @archbase/components when a table is present', async () => {
    const code = await generator.generate(baseOptions(tempDir));

    expect(code).toContain("import { ArchbaseDataGrid, ArchbaseDataGridColumn } from '@archbase/components';");
    expect(code).toContain('<ArchbaseDataGrid');
  });

  it('imports useArchbaseNavigationListener from @archbase/admin when withNavigation is enabled', async () => {
    const code = await generator.generate(baseOptions(tempDir));

    expect(code).toContain("import { useArchbaseNavigationListener } from '@archbase/admin';");
  });

  it('imports useArchbaseRemoteServiceApi from @archbase/data when serviceIntegration is enabled', async () => {
    const code = await generator.generate(baseOptions(tempDir, { serviceIntegration: true }));

    expect(code).toContain("from '@archbase/data'");
    expect(code).toContain('useArchbaseRemoteServiceApi');
  });

  it('never emits the legacy archbase-react monolith import', async () => {
    const code = await generator.generate(baseOptions(tempDir));
    expectV3Imports(code);
  });

  it('renders number-type table columns with escaped JSX meta', async () => {
    const options = baseOptions(tempDir, {
      tables: [
        {
          id: 'numbers',
          title: 'Numbers',
          dataSource: 'numbersDataSource',
          columns: [{ field: 'amount', title: 'Amount', type: 'number' }],
        },
      ],
    });

    const content = await generator.generate(options);
    expect(content).toContain('meta={{ isNumeric: true }}');
  });
});
