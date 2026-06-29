/**
 * DomainGenerator tests — class and interface DTO styles.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DomainGenerator } from '../../src/generators/DomainGenerator';
import { makeTempDir, cleanupDir, readGenerated, expectV3Imports } from '../helpers';

function fields() {
  return [
    { name: 'name', type: 'string', required: true },
    { name: 'email', type: 'email', required: false },
    { name: 'price', type: 'number', required: false },
    { name: 'active', type: 'boolean', required: false },
  ];
}

describe('DomainGenerator', () => {
  let generator: DomainGenerator;
  let tempDir: string;

  beforeEach(async () => {
    generator = new DomainGenerator();
    tempDir = await makeTempDir();
  });
  afterEach(async () => {
    await cleanupDir(tempDir);
  });

  describe('class style (default)', () => {
    it('generates a DTO class with constructor and newInstance', async () => {
      const result = await generator.generate({
        name: 'ProductDto', output: tempDir, typescript: true, fields: fields(),
        withValidation: true, withConstructor: true, withFactory: true, withAuditFields: true,
      } as any);
      expect(result.success).toBe(true);
      const content = await readGenerated(result.files[0]);
      expect(content).toContain('export class ProductDto');
      expect(content).toContain('constructor(');
      expect(content).toContain('newInstance');
      expect(content).toContain('isNew');
    });

    it('imports validation decorators from @archbase/core, not archbase-react', async () => {
      const result = await generator.generate({
        name: 'ProductDto', output: tempDir, typescript: true, fields: fields(),
        withValidation: true, withConstructor: true, withFactory: true, withAuditFields: true,
      } as any);
      const content = await readGenerated(result.files[0]);
      expectV3Imports(content);
      expect(content).toContain("from '@archbase/core'");
    });

    it('emits clean decorators: optional id, real type decorators, clean messages, no unused imports', async () => {
      const result = await generator.generate({
        name: 'ProductDto', output: tempDir, typescript: true, fields: fields(),
        withValidation: true, withConstructor: true, withFactory: true, withAuditFields: true,
      } as any);
      const content = await readGenerated(result.files[0]);
      // id is server/uuid-generated → optional, not @IsNotEmpty
      expect(content).toMatch(/@IsOptional\(\)\s*\n\s*@IsString\(\)\s*\n\s*id: string;/);
      // required field gets @IsNotEmpty + a type decorator + a clean message (no 'mentors:'/'dever')
      expect(content).toContain('@IsNotEmpty({');
      expect(content).toContain('message: "name é obrigatório",');
      expect(content).not.toContain('mentors:');
      expect(content).not.toContain('dever ser informado');
      // type/format decorators present
      expect(content).toContain('@IsNumber()');
      expect(content).toContain('@IsBoolean()');
      expect(content).toContain('@IsEmail()');
      // optional email → @IsOptional() + @IsEmail()
      expect(content).toMatch(/@IsOptional\(\)\s*\n\s*@IsEmail\(\)/);
      // unused decorator imports are not emitted
      expect(content).not.toContain('ValidateNested');
    });

    it('maps field types to valid TypeScript types (no leaked "email" type)', async () => {
      const result = await generator.generate({
        name: 'ProductDto', output: tempDir, typescript: true, fields: fields(),
        withValidation: false, withConstructor: false, withFactory: false, withAuditFields: false,
      } as any);
      const content = await readGenerated(result.files[0]);
      expect(content).not.toMatch(/:\s*email/);
      expect(content).toContain('name: string');
      expect(content).toContain('price: number');
      expect(content).toContain('active: boolean');
    });
  });

  describe('interface style', () => {
    it('generates interface + Create/Update DTOs', async () => {
      const result = await generator.generate({
        name: 'ProductDto', output: tempDir, style: 'interface', typescript: true, fields: fields(),
        withValidation: false, withConstructor: false, withFactory: false, withAuditFields: false,
      } as any);
      expect(result.success).toBe(true);
      const content = await readGenerated(result.files[0]);
      expect(content).toContain('export interface ProductDto');
      // Create/Update DTOs are derived from the base interface to avoid duplication.
      expect(content).toContain("export type ProductCreateDTO = Omit<ProductDto, 'id'>");
      expect(content).toContain('export type ProductUpdateDTO = Partial<ProductDto>');
      expect(content).not.toContain('export class');
    });

    it('does not duplicate the id field', async () => {
      const result = await generator.generate({
        name: 'ProductDto', output: tempDir, style: 'interface', typescript: true, fields: fields(),
        withValidation: false, withConstructor: false, withFactory: false, withAuditFields: true,
      } as any);
      const content = await readGenerated(result.files[0]);
      const idMatches = content.split('\n').filter((l) => /^\s*id[?:]/.test(l));
      // id appears once per interface (3 interfaces) at most, never twice in the same block
      expect(content).toContain('export interface ProductDto');
      // No consecutive duplicate id lines
      expect(content).not.toMatch(/id: string;\s*\n\s*id: string;/);
    });
  });
});
