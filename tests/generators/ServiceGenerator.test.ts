/**
 * ServiceGenerator tests — canonical ArchbaseRemoteApiService pattern.
 *
 * Note: ServiceGenerator.generate() returns the generated source as a string
 * and writes the file to <outputPath>/services/<ServiceName>.ts.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ServiceGenerator } from '../../src/generators/ServiceGenerator';
import { makeTempDir, cleanupDir, expectV3Imports } from '../helpers';

describe('ServiceGenerator', () => {
  let generator: ServiceGenerator;
  let tempDir: string;

  beforeEach(async () => {
    generator = new ServiceGenerator();
    tempDir = await makeTempDir();
  });
  afterEach(async () => {
    await cleanupDir(tempDir);
  });

  it('generates a service extending ArchbaseRemoteApiService and writes the file', async () => {
    const content = await generator.generate({
      serviceName: 'ProductService',
      entityName: 'Product',
      entityType: 'ProductDto',
      idType: 'string',
      endpoint: '/api/v1/products',
      outputPath: tempDir,
      generateDto: false,
    });

    expect(content).toContain('export class ProductService extends ArchbaseRemoteApiService<ProductDto, string>');
    expect(content).toContain('@injectable()');
    expect(content).toContain('getEndpoint()');
    expect(content).toContain('/api/v1/products');
    expect(content).toContain('transform(');
    expect(content).toContain('isNewRecord(');

    // File is written under services/
    const written = path.join(tempDir, 'services', 'ProductService.ts');
    expect(await fs.pathExists(written)).toBe(true);
  });

  it('imports from @archbase/data and never archbase-react', async () => {
    const content = await generator.generate({
      serviceName: 'ProductService',
      entityName: 'Product',
      entityType: 'ProductDto',
      endpoint: '/api/v1/products',
      outputPath: tempDir,
      generateDto: false,
    });
    expectV3Imports(content);
    expect(content).toContain("from '@archbase/data'");
    expect(content).toContain('ARCHBASE_IOC_API_TYPE');
  });
});
