/**
 * NavigationGenerator tests — verifies navigation items follow the
 * powerview-admin pattern with V3 (@archbase/admin) imports.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NavigationGenerator } from '../../src/generators/NavigationGenerator';
import { makeTempDir, cleanupDir, readGenerated, expectV3Imports } from '../helpers';

function baseConfig(output: string, overrides: Record<string, any> = {}) {
  return {
    name: 'Products',
    output,
    typescript: true,
    category: 'catalog',
    feature: 'products',
    label: 'Products',
    icon: 'IconBox',
    color: 'blue',
    showInSidebar: true,
    withForm: false,
    withView: true,
    ...overrides,
  } as any;
}

describe('NavigationGenerator', () => {
  let generator: NavigationGenerator;
  let tempDir: string;

  beforeEach(async () => {
    generator = new NavigationGenerator();
    tempDir = await makeTempDir();
  });

  afterEach(async () => {
    await cleanupDir(tempDir);
  });

  it('generates navigation item and route files successfully', async () => {
    const result = await generator.generate(baseConfig(tempDir));
    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(2);
    expect(result.files.some(f => f.endsWith('ProductsNavigation.tsx'))).toBe(true);
    expect(result.files.some(f => f.endsWith('ProductsRoutes.ts'))).toBe(true);
  });

  it('imports ArchbaseNavigationItem from @archbase/admin', async () => {
    const result = await generator.generate(baseConfig(tempDir));
    const navFile = result.files.find(f => f.endsWith('Navigation.tsx'))!;
    const content = await readGenerated(navFile);

    expect(content).toContain("import { ArchbaseNavigationItem } from '@archbase/admin';");
    expectV3Imports(content);
  });

  it('generates route constants with the admin route', async () => {
    const result = await generator.generate(baseConfig(tempDir));
    const routeFile = result.files.find(f => f.endsWith('Routes.ts'))!;
    const content = await readGenerated(routeFile);

    expect(content).toContain('PRODUCTS_ROUTE');
    expect(content).toContain('/admin/catalog/products');
  });

  it('includes the form route when withForm is enabled', async () => {
    const result = await generator.generate(baseConfig(tempDir, { withForm: true }));
    const routeFile = result.files.find(f => f.endsWith('Routes.ts'))!;
    const content = await readGenerated(routeFile);

    expect(content).toContain('PRODUCTS_FORM_ROUTE');
  });
});
