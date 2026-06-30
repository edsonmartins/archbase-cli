/**
 * PageGenerator tests — verifies page scaffolds use a real Mantine shell and
 * never reference the previously-fictional Archbase layout components.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PageGenerator } from '../../src/generators/PageGenerator';
import { makeTempDir, cleanupDir, readGenerated, expectV3Imports } from '../helpers';

function baseConfig(output: string, overrides: Record<string, any> = {}) {
  return {
    layout: 'blank',
    output,
    typescript: true,
    test: false,
    story: false,
    withAuth: false,
    withNavigation: false,
    withFooter: false,
    ...overrides,
  } as any;
}

const FICTIONAL = /ArchbaseLayout|ArchbaseSidebar|ArchbaseHeader|ArchbaseDashboard|ArchbaseContainer|ArchbaseBreadcrumb|ArchbaseNavigation|ArchbaseCard|ProtectedRoute/;

describe('PageGenerator', () => {
  let generator: PageGenerator;
  let tempDir: string;

  beforeEach(async () => {
    generator = new PageGenerator();
    tempDir = await makeTempDir();
  });

  afterEach(async () => {
    await cleanupDir(tempDir);
  });

  it('generates a page file successfully', async () => {
    const result = await generator.generate('HomePage', baseConfig(tempDir));
    expect(result.success).toBe(true);
    expect(result.files[0]).toMatch(/HomePage\.tsx$/);
  });

  it('every layout renders a real Mantine shell with matching imports', async () => {
    for (const layout of ['blank', 'sidebar', 'header', 'dashboard']) {
      const result = await generator.generate(`${layout}Page`, baseConfig(tempDir, { layout }));
      const content = await readGenerated(result.files[0]);

      expectV3Imports(content);
      // Imports and body both reference the same real Mantine primitives.
      expect(content).toContain("import { Container, Stack, Title } from '@mantine/core';");
      expect(content).toContain('<Container');
      expect(content).toContain('<Title');
      // No previously-fictional layout components leak into the output.
      expect(content).not.toMatch(FICTIONAL);
    }
  });

  it('wraps the page in ArchbaseViewSecurityProvider when withAuth is set', async () => {
    const result = await generator.generate('SecurePage', baseConfig(tempDir, { withAuth: true }));
    const content = await readGenerated(result.files[0]);

    // Imported from a resolved @archbase/* package (not the legacy monolith).
    expect(content).toMatch(/import \{[^}]*ArchbaseViewSecurityProvider[^}]*\} from '@archbase\//);
    expect(content).toContain('<ArchbaseViewSecurityProvider');
    // ProtectedRoute was the old fictional wrapper — it must be gone.
    expect(content).not.toContain('ProtectedRoute');
  });
});
