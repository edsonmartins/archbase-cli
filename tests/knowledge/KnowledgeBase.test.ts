/**
 * KnowledgeBase tests — verifies the curated component knowledge and the
 * broad V3 catalog augmentation are exposed through the real public API.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { KnowledgeBase } from '../../src/knowledge/KnowledgeBase';

describe('KnowledgeBase', () => {
  let knowledgeBase: KnowledgeBase;

  beforeEach(() => {
    knowledgeBase = new KnowledgeBase();
  });

  it('returns a rich curated entry for ArchbaseEdit', async () => {
    const component = await knowledgeBase.getComponent('ArchbaseEdit');

    expect(component).not.toBeNull();
    expect(component!.name).toBe('ArchbaseEdit');
    // Curated entries carry real props and examples.
    expect(Object.keys(component!.props).length).toBeGreaterThan(0);
    expect(component!.props.dataField).toBeDefined();
    expect(component!.examples.length).toBeGreaterThan(0);
    // Curated component depends on a modular V3 package.
    expect(component!.dependencies.some(d => d.startsWith('@archbase/'))).toBe(true);
  });

  it('resolves components case-insensitively', async () => {
    const component = await knowledgeBase.getComponent('archbaseedit');

    expect(component).not.toBeNull();
    expect(component!.name).toBe('ArchbaseEdit');
  });

  it('exposes broad-catalog components with an @archbase/* dependency', async () => {
    const component = await knowledgeBase.getComponent('ArchbaseAccessTokenService');

    expect(component).not.toBeNull();
    expect(component!.name).toBe('ArchbaseAccessTokenService');
    expect(component!.dependencies.some(d => d.startsWith('@archbase/'))).toBe(true);
  });

  it('exposes typed props (not "unknown") for catalog-only components', async () => {
    // ArchbaseActionButtons is not curated — its metadata comes from the synced
    // catalog, which must carry real prop types/required flags/descriptions.
    const component = await knowledgeBase.getComponent('ArchbaseActionButtons');

    expect(component).not.toBeNull();
    const props = component!.props;
    expect(Object.keys(props).length).toBeGreaterThan(0);
    // No prop should be left as the old type:'unknown' placeholder.
    const types = Object.values(props).map(p => p.type);
    expect(types.every(t => t && t !== 'unknown')).toBe(true);
    // At least one required prop is surfaced.
    expect(Object.values(props).some(p => p.required)).toBe(true);
    // AI hint includes a ready-to-paste import statement.
    expect(component!.aiHints?.some(h => h.startsWith('Import: import {'))).toBe(true);
  });

  it('returns null for an unknown component', async () => {
    const component = await knowledgeBase.getComponent('TotallyMadeUpComponent');

    expect(component).toBeNull();
  });
});
