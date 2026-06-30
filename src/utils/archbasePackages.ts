/**
 * Archbase V3 package/import resolver.
 *
 * Single source of truth for mapping an Archbase symbol (component, hook, type,
 * service, constant) to the `@archbase/*` package it is exported from.
 *
 * The data is derived from two sources, in priority order:
 *   1. Real imports found in the reference admin projects (ground truth).
 *   2. The archbase-react `component-catalog.json` (breadth fallback).
 *
 * See scripts/ and src/knowledge/archbase-v3-symbol-packages.json for how the
 * embedded map is produced.
 */

import symbolPackages from '../knowledge/archbase-v3-symbol-packages.json';

export const ARCHBASE_PACKAGES = [
  '@archbase/core',
  '@archbase/components',
  '@archbase/data',
  '@archbase/template',
  '@archbase/admin',
  '@archbase/layout',
  '@archbase/security',
  '@archbase/security-ui',
  '@archbase/advanced',
  '@archbase/ssr',
  '@archbase/tools',
  '@archbase/feature-flags',
] as const;

export type ArchbasePackage = (typeof ARCHBASE_PACKAGES)[number];

const SYMBOL_PACKAGES: Record<string, string> = symbolPackages as Record<string, string>;

/**
 * Heuristic fallback when a symbol is not in the embedded map. Keeps generated
 * code on a sensible default package rather than the legacy monolith.
 */
function heuristicPackage(symbol: string): ArchbasePackage {
  if (/Service$|RemoteApi|DataSource|ServiceApi/.test(symbol)) return '@archbase/data';
  if (/^use|Provider$|Validator|IOC|^ARCHBASE_IOC/.test(symbol)) return '@archbase/core';
  if (/Template$/.test(symbol)) return '@archbase/template';
  if (/Navigation|AdminLayout|AdminMainLayout/.test(symbol)) return '@archbase/admin';
  // Security-UI views must be tested before the broad Security branch below,
  // otherwise `*SecurityView` symbols would be shadowed onto @archbase/security.
  if (/ApiToken|SecurityView|SecurityUi/.test(symbol)) return '@archbase/security-ui';
  if (/Security|Authenticator|AccessToken|TokenManager/.test(symbol)) return '@archbase/security';
  return '@archbase/components';
}

/**
 * Resolve the `@archbase/*` package for a single symbol.
 * Returns the embedded mapping when known, otherwise a heuristic default.
 */
export function resolveArchbasePackage(symbol: string): string {
  const clean = symbol.trim().replace(/\s+as\s+\w+$/, '');
  return SYMBOL_PACKAGES[clean] ?? heuristicPackage(clean);
}

/** True when the symbol has an explicit (non-heuristic) mapping. */
export function isKnownArchbaseSymbol(symbol: string): boolean {
  return Object.prototype.hasOwnProperty.call(SYMBOL_PACKAGES, symbol.trim());
}

/**
 * Group a flat list of symbols by their `@archbase/*` package.
 * Symbols are de-duplicated and sorted; packages are returned in a stable,
 * conventional order (core/components/data/template/...).
 */
export function groupImportsByPackage(symbols: string[]): Map<string, string[]> {
  const byPackage = new Map<string, Set<string>>();
  for (const raw of symbols) {
    const symbol = raw.trim();
    if (!symbol) continue;
    const pkg = resolveArchbasePackage(symbol);
    if (!byPackage.has(pkg)) byPackage.set(pkg, new Set());
    byPackage.get(pkg)!.add(symbol);
  }

  // resolveArchbasePackage always returns an @archbase/* package, so iterating
  // ARCHBASE_PACKAGES in conventional order fully drains `byPackage`.
  const ordered = new Map<string, string[]>();
  for (const pkg of ARCHBASE_PACKAGES) {
    if (byPackage.has(pkg)) {
      ordered.set(pkg, Array.from(byPackage.get(pkg)!).sort());
    }
  }
  return ordered;
}

/**
 * Build `import { ... } from '@archbase/x'` statements for the given symbols,
 * one line per package, in conventional order.
 */
export function buildArchbaseImports(symbols: string[]): string[] {
  const grouped = groupImportsByPackage(symbols);
  const lines: string[] = [];
  for (const [pkg, syms] of grouped) {
    lines.push(`import { ${syms.join(', ')} } from '${pkg}';`);
  }
  return lines;
}
