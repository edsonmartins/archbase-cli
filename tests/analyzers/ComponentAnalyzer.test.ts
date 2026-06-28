/**
 * ComponentAnalyzer tests — AST extraction from a React/TSX component.
 *
 * Public API: analyzeFile(filePath) / analyzeComponent(filePath) read a file from
 * disk and return a ComponentAnalysis: { name, filePath, props[], imports[],
 * dataSourceUsage, complexity, hooks[], dependencies[] }.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ComponentAnalyzer } from '../../src/analyzers/ComponentAnalyzer';
import { makeTempDir, cleanupDir } from '../helpers';

const COMPONENT = `
import React from 'react';
import { ArchbaseEdit } from '@archbase/components';

export interface ProductFormProps {
  title: string;
  count?: number;
  active: boolean;
  dataSource: any;
}

export function ProductForm(props: ProductFormProps) {
  const validator = useArchbaseValidator();
  return <ArchbaseEdit dataField="name" />;
}

export default ProductForm;
`;

describe('ComponentAnalyzer', () => {
  let tempDir: string;
  let file: string;

  beforeEach(async () => {
    tempDir = await makeTempDir();
    file = path.join(tempDir, 'ProductForm.tsx');
    await fs.writeFile(file, COMPONENT);
  });
  afterEach(async () => {
    await cleanupDir(tempDir);
  });

  it('extracts the component name', async () => {
    const analysis = await new ComponentAnalyzer().analyzeFile(file);
    expect(analysis).not.toBeNull();
    expect(analysis!.name).toBe('ProductForm');
  });

  it('extracts props from the Props interface with names, types and required flags', async () => {
    const analysis = await new ComponentAnalyzer().analyzeFile(file);
    const byName = Object.fromEntries(analysis!.props.map((p) => [p.name, p]));

    expect(Object.keys(byName).sort()).toEqual(['active', 'count', 'dataSource', 'title']);
    expect(byName.title).toMatchObject({ type: 'string', required: true });
    expect(byName.count).toMatchObject({ type: 'number', required: false });
    expect(byName.active).toMatchObject({ type: 'boolean', required: true });
  });

  it('records imports and flags @archbase dependencies', async () => {
    const analysis = await new ComponentAnalyzer().analyzeFile(file);
    const sources = analysis!.imports.map((i) => i.source);
    expect(sources).toContain('react');
    expect(sources).toContain('@archbase/components');
    expect(analysis!.dependencies).toContain('@archbase/components');
  });

  it('detects DataSource usage via the dataSource prop', async () => {
    const analysis = await new ComponentAnalyzer().analyzeFile(file);
    expect(analysis!.dataSourceUsage.hasDataSource).toBe(true);
  });

  it('detects hook usage', async () => {
    const analysis = await new ComponentAnalyzer().analyzeFile(file);
    expect(analysis!.hooks).toContain('useArchbaseValidator');
  });

  it('returns null for unreadable files', async () => {
    const analysis = await new ComponentAnalyzer().analyzeFile(
      path.join(tempDir, 'does-not-exist.tsx')
    );
    expect(analysis).toBeNull();
  });
});
