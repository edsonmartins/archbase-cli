/**
 * Tests for idempotent project wiring used by `create module`.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import { makeTempDir, cleanupDir } from '../helpers';
import {
  resolveIocTypesName,
  writeBarrel,
  patchIocTypes,
  patchIocContainer,
  patchNavConstants,
} from '../../src/utils/projectWiring';

async function scaffoldProject(base: string) {
  await fs.ensureDir(path.join(base, 'ioc'));
  await fs.ensureDir(path.join(base, 'navigation'));
  await fs.writeFile(
    path.join(base, 'ioc', 'IOCTypes.ts'),
    `import { ARCHBASE_IOC_API_TYPE } from '@archbase/core';\n\nexport const API_TYPE = {\n  ApiClient: ARCHBASE_IOC_API_TYPE.ApiClient,\n  Existing: Symbol.for('ExistingService'),\n};\n`,
  );
  await fs.writeFile(
    path.join(base, 'ioc', 'ContainerIOC.ts'),
    `import { API_TYPE } from './IOCTypes';\nimport { ExistingService } from '../services/ExistingService';\n\nconst container = IOCContainer.getContainer();\n\ncontainer\n  .bind<ExistingService>(API_TYPE.Existing)\n  .to(ExistingService);\n\nexport { container };\n`,
  );
  await fs.writeFile(
    path.join(base, 'navigation', 'navigationDataConstants.tsx'),
    `export const DASHBOARD_ROUTE = '/dashboard';\n`,
  );
}

describe('projectWiring', () => {
  let base: string;
  beforeEach(async () => { base = await makeTempDir(); });
  afterEach(async () => { await cleanupDir(base); });

  it('resolveIocTypesName finds the project IOC types file, else defaults', async () => {
    expect(resolveIocTypesName(base)).toBe('IOCTypes'); // none yet → default
    await fs.ensureDir(path.join(base, 'ioc'));
    await fs.writeFile(path.join(base, 'ioc', 'RapidexIOCTypes.ts'), 'export const API_TYPE = {};\n');
    expect(resolveIocTypesName(base)).toBe('RapidexIOCTypes');
  });

  it('patchIocTypes adds a Symbol.for entry and is idempotent', async () => {
    await scaffoldProject(base);
    const first = await patchIocTypes(base, 'Product');
    expect(first.action).toBe('patched');
    const content = await fs.readFile(path.join(base, 'ioc', 'IOCTypes.ts'), 'utf-8');
    expect(content).toContain("Product: Symbol.for('ProductService'),");
    expect(content).toContain("Existing: Symbol.for('ExistingService'),"); // preserved

    const second = await patchIocTypes(base, 'Product');
    expect(second.action).toBe('skipped');
    const after = await fs.readFile(path.join(base, 'ioc', 'IOCTypes.ts'), 'utf-8');
    expect(after.match(/Product: Symbol\.for/g)?.length).toBe(1); // not duplicated
  });

  it('patchIocContainer adds import + binding and is idempotent', async () => {
    await scaffoldProject(base);
    const first = await patchIocContainer(base, 'ProductService', 'Product');
    expect(first.action).toBe('patched');
    const content = await fs.readFile(path.join(base, 'ioc', 'ContainerIOC.ts'), 'utf-8');
    expect(content).toContain('import { ProductService } from "../services/ProductService";');
    expect(content).toContain('.bind<ProductService>(API_TYPE.Product)');
    expect(content).toContain('.to(ProductService);');

    const second = await patchIocContainer(base, 'ProductService', 'Product');
    expect(second.action).toBe('skipped');
  });

  it('patchNavConstants appends route constants and is idempotent', async () => {
    await scaffoldProject(base);
    const first = await patchNavConstants(base, 'PRODUCT', '/admin/configuracao/product');
    expect(first.action).toBe('patched');
    const content = await fs.readFile(path.join(base, 'navigation', 'navigationDataConstants.tsx'), 'utf-8');
    expect(content).toContain("export const PRODUCT_ROUTE = '/admin/configuracao/product';");
    expect(content).toContain("export const PRODUCT_FORM_ROUTE = '/admin/configuracao/product/:id';");

    const second = await patchNavConstants(base, 'PRODUCT', '/admin/configuracao/product');
    expect(second.action).toBe('skipped');
  });

  it('writeBarrel creates then extends without duplicating', async () => {
    const barrel = path.join(base, 'domain', 'index.ts');
    const created = await writeBarrel(barrel, ["export * from './ProductDto';"]);
    expect(created.action).toBe('created');

    const extended = await writeBarrel(barrel, ["export * from './OrderDto';"]);
    expect(extended.action).toBe('patched');
    const content = await fs.readFile(barrel, 'utf-8');
    expect(content).toContain("export * from './ProductDto';");
    expect(content).toContain("export * from './OrderDto';");

    const noop = await writeBarrel(barrel, ["export * from './ProductDto';"]);
    expect(noop.action).toBe('skipped');
  });

  it('gracefully skips when target files are absent (greenfield)', async () => {
    expect((await patchIocTypes(base, 'Product')).action).toBe('skipped');
    expect((await patchIocContainer(base, 'ProductService', 'Product')).action).toBe('skipped');
    expect((await patchNavConstants(base, 'PRODUCT', '/x')).action).toBe('skipped');
  });
});
