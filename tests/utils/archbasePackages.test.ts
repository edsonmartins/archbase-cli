/**
 * Tests for the central @archbase/* import resolver.
 */

import { describe, it, expect } from 'vitest';
import {
  resolveArchbasePackage,
  isKnownArchbaseSymbol,
  groupImportsByPackage,
  buildArchbaseImports,
  ARCHBASE_PACKAGES,
} from '../../src/utils/archbasePackages';

describe('archbasePackages resolver', () => {
  describe('resolveArchbasePackage', () => {
    it('resolves known component symbols to @archbase/components', () => {
      expect(resolveArchbasePackage('ArchbaseEdit')).toBe('@archbase/components');
      expect(resolveArchbasePackage('ArchbaseSelect')).toBe('@archbase/components');
      expect(resolveArchbasePackage('ArchbaseDataGridColumn')).toBe('@archbase/components');
    });

    it('resolves template symbols to @archbase/template', () => {
      expect(resolveArchbasePackage('ArchbaseFormTemplate')).toBe('@archbase/template');
      expect(resolveArchbasePackage('ArchbaseGridTemplate')).toBe('@archbase/template');
    });

    it('resolves data hooks/services to @archbase/data', () => {
      expect(resolveArchbasePackage('useArchbaseRemoteDataSource')).toBe('@archbase/data');
      expect(resolveArchbasePackage('useArchbaseRemoteServiceApi')).toBe('@archbase/data');
      expect(resolveArchbasePackage('ArchbaseRemoteApiService')).toBe('@archbase/data');
    });

    it('resolves navigation symbols to @archbase/admin', () => {
      expect(resolveArchbasePackage('ArchbaseNavigationItem')).toBe('@archbase/admin');
      expect(resolveArchbasePackage('useArchbaseNavigationListener')).toBe('@archbase/admin');
    });

    it('resolves security view symbols to @archbase/security-ui', () => {
      expect(resolveArchbasePackage('ArchbaseSecurityView')).toBe('@archbase/security-ui');
      expect(resolveArchbasePackage('ArchbaseApiTokenView')).toBe('@archbase/security-ui');
    });

    it('resolves core utilities to @archbase/core', () => {
      expect(resolveArchbasePackage('useArchbaseValidator')).toBe('@archbase/core');
      expect(resolveArchbasePackage('ARCHBASE_IOC_API_TYPE')).toBe('@archbase/core');
    });

    it('never resolves to the legacy archbase-react monolith', () => {
      for (const sym of ['ArchbaseEdit', 'SomethingUnknownArchbaseThing', 'useArchbaseFoo']) {
        expect(resolveArchbasePackage(sym)).not.toBe('archbase-react');
        expect(ARCHBASE_PACKAGES).toContain(resolveArchbasePackage(sym) as any);
      }
    });

    it('applies heuristics for unknown symbols', () => {
      expect(resolveArchbasePackage('FooService')).toBe('@archbase/data');
      expect(resolveArchbasePackage('useFooBar')).toBe('@archbase/core');
      expect(resolveArchbasePackage('SomethingTemplate')).toBe('@archbase/template');
    });

    it('routes unknown *SecurityView symbols to security-ui, not security (heuristic order)', () => {
      // The broad /Security/ branch must not shadow the security-ui views.
      expect(resolveArchbasePackage('MyCustomSecurityView')).toBe('@archbase/security-ui');
      expect(resolveArchbasePackage('TenantApiTokenView')).toBe('@archbase/security-ui');
      // Genuine security (non-view) symbols still resolve to @archbase/security.
      expect(resolveArchbasePackage('FooAuthenticator')).toBe('@archbase/security');
    });
  });

  describe('isKnownArchbaseSymbol', () => {
    it('is true for catalogued symbols and false for invented ones', () => {
      expect(isKnownArchbaseSymbol('ArchbaseEdit')).toBe(true);
      expect(isKnownArchbaseSymbol('TotallyMadeUpSymbol123')).toBe(false);
    });
  });

  describe('groupImportsByPackage', () => {
    it('groups, de-duplicates and orders packages conventionally', () => {
      const grouped = groupImportsByPackage([
        'ArchbaseFormTemplate',
        'ArchbaseEdit',
        'ArchbaseEdit',
        'useArchbaseValidator',
      ]);
      expect(grouped.get('@archbase/components')).toEqual(['ArchbaseEdit']);
      expect(grouped.get('@archbase/template')).toEqual(['ArchbaseFormTemplate']);
      expect(grouped.get('@archbase/core')).toEqual(['useArchbaseValidator']);
      // core comes before components in conventional order
      const keys = [...grouped.keys()];
      expect(keys.indexOf('@archbase/core')).toBeLessThan(keys.indexOf('@archbase/components'));
    });
  });

  describe('buildArchbaseImports', () => {
    it('builds one import line per package', () => {
      const lines = buildArchbaseImports(['ArchbaseEdit', 'ArchbaseFormTemplate']);
      expect(lines).toContain("import { ArchbaseEdit } from '@archbase/components';");
      expect(lines).toContain("import { ArchbaseFormTemplate } from '@archbase/template';");
      expect(lines.every((l) => !l.includes('archbase-react'))).toBe(true);
    });
  });
});
