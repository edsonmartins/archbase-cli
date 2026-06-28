/**
 * Shared test helpers.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

/** Create an isolated temp directory for a test. */
export async function makeTempDir(prefix = 'archbase-cli-test-'): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

/** Remove a temp directory (ignores errors). */
export async function cleanupDir(dir: string): Promise<void> {
  await fs.remove(dir).catch(() => undefined);
}

/** Read a generated file as UTF-8 text. */
export async function readGenerated(file: string): Promise<string> {
  return fs.readFile(file, 'utf-8');
}

/** Recursively collect all files under a directory. */
export async function listFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(d: string) {
    const entries = await fs.readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) await walk(p);
      else out.push(p);
    }
  }
  if (await fs.pathExists(dir)) await walk(dir);
  return out;
}

/** Assert that generated source uses the V3 modular packages and not the legacy monolith. */
export function expectV3Imports(content: string): void {
  expect(content).not.toMatch(/from ['"]archbase-react['"]/);
}
