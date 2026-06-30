/**
 * ComponentGenerator tests — verifies custom component generation follows the
 * real ComponentGenerator API (generate(name, config)) and V3 conventions.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComponentGenerator } from '../../src/generators/ComponentGenerator';
import { makeTempDir, cleanupDir, readGenerated, expectV3Imports } from '../helpers';

function baseConfig(output: string, overrides: Record<string, any> = {}) {
  return {
    type: 'display',
    props: 'title:string,count:number',
    output,
    typescript: true,
    test: false,
    story: false,
    withState: false,
    withEffects: false,
    withMemo: false,
    ...overrides,
  } as any;
}

describe('ComponentGenerator', () => {
  let generator: ComponentGenerator;
  let tempDir: string;

  beforeEach(async () => {
    generator = new ComponentGenerator();
    tempDir = await makeTempDir();
  });

  afterEach(async () => {
    await cleanupDir(tempDir);
  });

  it('generates a component file successfully', async () => {
    const result = await generator.generate('UserCard', baseConfig(tempDir));
    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(1);
    expect(result.files[0]).toMatch(/UserCard\.tsx$/);
  });

  it('turns props into a typed Props interface', async () => {
    const result = await generator.generate('ProductCard', baseConfig(tempDir));
    const content = await readGenerated(result.files[0]);

    expect(content).toMatch(/interface ProductCardProps/);
    expect(content).toMatch(/title\s*:\s*string/);
    expect(content).toMatch(/count\s*:\s*number/);
    expect(content).toContain('React.FC<ProductCardProps>');
  });

  it('uses @archbase/components for input components', async () => {
    const result = await generator.generate('CustomInput', baseConfig(tempDir, {
      type: 'input',
      props: 'value:string,enabled:boolean',
    }));
    const content = await readGenerated(result.files[0]);

    expect(content).toContain("from '@archbase/components'");
    expect(content).toContain('ArchbaseEdit');
  });

  it('emits useState when withState is enabled', async () => {
    const result = await generator.generate('StatefulCard', baseConfig(tempDir, {
      withState: true,
    }));
    const content = await readGenerated(result.files[0]);

    expect(content).toContain('useState');
    expect(content).toMatch(/import React, \{[^}]*useState[^}]*\} from 'react'/);
  });

  it('never emits the legacy archbase-react monolith import', async () => {
    for (const type of ['display', 'input', 'layout', 'functional']) {
      const result = await generator.generate(`${type}Comp`, baseConfig(tempDir, { type }));
      const content = await readGenerated(result.files[0]);
      expectV3Imports(content);
    }
  });

  it('display/layout bodies use real Mantine components, not fictional Archbase* tags', async () => {
    const display = await readGenerated(
      (await generator.generate('InfoCard', baseConfig(tempDir, { type: 'display' }))).files[0]
    );
    expect(display).toContain("from '@mantine/core'");
    expect(display).toContain('<Card');
    expect(display).not.toMatch(/ArchbaseCard|ArchbaseText/);

    const layout = await readGenerated(
      (await generator.generate('PageShell', baseConfig(tempDir, { type: 'layout', props: 'heading:string' }))).files[0]
    );
    expect(layout).toContain('<Container');
    expect(layout).toContain('<Grid');
    expect(layout).not.toMatch(/ArchbaseContainer|ArchbaseRow|ArchbaseCol/);
  });

  it('generates a companion test file on demand', async () => {
    const result = await generator.generate('FullCard', baseConfig(tempDir, {
      test: true,
    }));
    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(2);
    expect(result.files.some(f => f.endsWith('.test.tsx'))).toBe(true);
  });

  it('generates a Storybook story file', async () => {
    const result = await generator.generate('FullCard', baseConfig(tempDir, {
      story: true,
      props: 'title:string',
    }));
    expect(result.success).toBe(true);
    expect(result.files.some((f) => f.endsWith('.stories.tsx'))).toBe(true);
  });
});
