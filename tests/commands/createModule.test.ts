/**
 * Smoke test for `archbase create module` scaffolding.
 *
 * Rather than spawning the compiled binary, this replicates exactly what the
 * `create module` action does (src/commands/create.ts) by driving the four
 * generators directly. It asserts the canonical module layout is produced and
 * that no generated file leaks the legacy `archbase-react` monolith import.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import { DomainGenerator } from '../../src/generators/DomainGenerator';
import { ServiceGenerator } from '../../src/generators/ServiceGenerator';
import { ViewGenerator } from '../../src/generators/ViewGenerator';
import { FormGenerator } from '../../src/generators/FormGenerator';
import { makeTempDir, cleanupDir, listFiles, readGenerated, expectV3Imports } from '../helpers';

/** Replicates the scaffolding logic of `archbase create module <name>`. */
async function scaffoldModule(base: string, name: string, fieldsCsv: string) {
  const entity = name.charAt(0).toUpperCase() + name.slice(1);
  const feature = entity.toLowerCase();
  const fieldsArray = fieldsCsv.split(',').map((f) => {
    const [fieldName, fieldType = 'text'] = f.trim().split(':');
    return { name: fieldName.trim(), type: fieldType.trim(), required: false };
  });

  await new DomainGenerator().generate({
    name: `${entity}Dto`,
    output: path.join(base, 'domain'),
    style: 'class',
    typescript: true,
    fields: fieldsArray,
    withValidation: true,
    withConstructor: true,
    withFactory: true,
    withAuditFields: true,
  } as any);

  await new ServiceGenerator().generate({
    serviceName: `${entity}Service`,
    entityName: entity,
    entityType: `${entity}Dto`,
    idType: 'string',
    endpoint: `/api/v1/${feature}`,
    outputPath: base,
    generateDto: false,
  } as any);

  await new ViewGenerator().generate(`${entity}View`, {
    fields: fieldsCsv,
    output: path.join(base, 'views', feature),
    typescript: true,
    test: false,
    story: false,
    feature,
    withPermissions: true,
    withFilters: true,
    withPagination: true,
    withSorting: true,
  } as any);

  await new FormGenerator().generate(`${entity}Form`, {
    fields: fieldsCsv,
    validation: 'yup',
    template: 'basic',
    output: path.join(base, 'views', feature),
    typescript: true,
    test: false,
    story: false,
    feature,
  } as any);
}

describe('create module (scaffolding smoke test)', () => {
  let tempDir: string;
  let base: string;

  beforeEach(async () => {
    tempDir = await makeTempDir();
    base = path.join(tempDir, 'src');
    await scaffoldModule(base, 'Product', 'name:text,price:number');
  });
  afterEach(async () => {
    await cleanupDir(tempDir);
  });

  it('creates the canonical module file layout', async () => {
    const files = (await listFiles(base)).map((f) => path.relative(base, f));
    expect(files).toContain(path.join('domain', 'ProductDto.ts'));
    expect(files).toContain(path.join('services', 'ProductService.ts'));
    expect(files).toContain(path.join('views', 'product', 'ProductView.tsx'));
    expect(files).toContain(path.join('views', 'product', 'ProductForm.tsx'));
  });

  it('produces no file that imports the legacy archbase-react monolith', async () => {
    const files = await listFiles(base);
    for (const file of files) {
      const content = await readGenerated(file);
      expectV3Imports(content);
    }
  });

  it('wires the DTO, service, view and form to the Product entity', async () => {
    const dto = await readGenerated(path.join(base, 'domain', 'ProductDto.ts'));
    const service = await readGenerated(path.join(base, 'services', 'ProductService.ts'));
    const view = await readGenerated(path.join(base, 'views', 'product', 'ProductView.tsx'));
    const form = await readGenerated(path.join(base, 'views', 'product', 'ProductForm.tsx'));

    expect(dto).toContain('ProductDto');
    expect(service).toContain('ProductService');
    expect(service).toContain('/api/v1/product');
    expect(view).toContain('ProductView');
    expect(form).toContain('ProductForm');
  });
});
