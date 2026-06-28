/**
 * SecurityGenerator tests — type→template mapping and valid V3 output.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SecurityGenerator } from '../../src/generators/SecurityGenerator';
import { makeTempDir, cleanupDir, readGenerated, expectV3Imports } from '../helpers';

describe('SecurityGenerator', () => {
  let generator: SecurityGenerator;
  let tempDir: string;

  beforeEach(async () => {
    generator = new SecurityGenerator();
    tempDir = await makeTempDir();
  });
  afterEach(async () => {
    await cleanupDir(tempDir);
  });

  const viewTypes = ['security-management', 'user-management', 'api-tokens', 'login'] as const;

  for (const type of viewTypes) {
    it(`generates the '${type}' view without unresolved template tokens`, async () => {
      const result = await generator.generate({ name: 'MySec', type, output: tempDir } as any);
      expect(result.success).toBe(true);
      expect(result.files && result.files.length).toBeGreaterThan(0);

      const content = await readGenerated(result.files![0]);
      expectV3Imports(content);
      // No leftover Handlebars control tokens or escape helpers
      expect(content).not.toContain('{{#');
      expect(content).not.toContain('{{lt}}');
      expect(content).not.toContain('hasFeature');
    });
  }

  it('generates the authenticator as a .ts file', async () => {
    const result = await generator.generate({ name: 'MyAuth', type: 'authenticator', output: tempDir } as any);
    expect(result.success).toBe(true);
    expect(result.files![0]).toMatch(/\.ts$/);
  });

  it('fails with a helpful error for an unknown type', async () => {
    const result = await generator.generate({ name: 'X', type: 'nonexistent' as any, output: tempDir } as any);
    expect(result.success).toBe(false);
    expect(result.errors![0]).toContain('Known types');
  });
});
