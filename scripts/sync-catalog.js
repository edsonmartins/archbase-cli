#!/usr/bin/env node
/**
 * sync-catalog.js — regenerate src/knowledge/archbase-v3-catalog.json from the
 * source-of-truth archbase-react/component-catalog.json.
 *
 * The bundled catalog is what the CLI ships and what feeds `query component`.
 * This keeps the rich, typed prop metadata (name/type/required/description) and
 * the real per-component package (exportsFrom) instead of dropping them.
 *
 * Usage:
 *   node scripts/sync-catalog.js [path/to/component-catalog.json]
 *   ARCHBASE_CATALOG=/abs/path node scripts/sync-catalog.js
 */
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const sourcePath =
  process.argv[2] ||
  process.env.ARCHBASE_CATALOG ||
  path.resolve(repoRoot, '../archbase-react/component-catalog.json');
const outPath = path.resolve(repoRoot, 'src/knowledge/archbase-v3-catalog.json');

const PLACEHOLDER = /Exportar tudo de cada arquivo|@ts-nocheck/;

function cleanDescription(desc, name, pkg) {
  const raw = (desc || '').trim();
  const firstLine = raw.split('\n')[0].trim();
  const bad =
    !firstLine ||
    firstLine.length < 8 ||
    PLACEHOLDER.test(firstLine) ||
    firstLine.startsWith('//') ||
    firstLine.startsWith('@');
  if (bad) {
    return `${name} — componente ${pkg.replace('@archbase/', '')}`;
  }
  return firstLine;
}

function parseStatus(desc) {
  const m = /@status\s+(stable|beta|deprecated)/i.exec(desc || '');
  return m ? m[1].toLowerCase() : 'stable';
}

function main() {
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source catalog not found: ${sourcePath}`);
    console.error('   Pass the path as an argument or set ARCHBASE_CATALOG.');
    process.exit(1);
  }

  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
  const srcComponents = source.components || [];

  const packages = new Set();
  const componentPackageMap = {};
  let withProps = 0;
  let totalProps = 0;

  const components = srcComponents.map((c) => {
    const pkg = c.exportsFrom && c.exportsFrom.startsWith('@archbase/')
      ? c.exportsFrom
      : '@archbase/components';
    packages.add(pkg);
    componentPackageMap[c.name] = pkg;

    const props = (c.props || [])
      .filter((p) => p && p.name)
      .map((p) => ({
        name: p.name,
        type: p.type || 'unknown',
        required: !!p.required,
        description: (p.description || '').trim(),
      }));
    if (props.length) withProps++;
    totalProps += props.length;

    return {
      name: c.name,
      package: pkg,
      description: cleanDescription(c.description, c.name, pkg),
      status: parseStatus(c.description),
      tags: c.tags || [],
      sourcePath: c.sourcePath || '',
      canonicalUrl: c.canonicalUrl || '',
      props,
    };
  });

  const out = {
    version: source.version || '0.0.0',
    generatedAt: source.generatedAt || '',
    syncedAt: new Date().toISOString(),
    source: 'archbase-react/component-catalog.json',
    packages: Array.from(packages).sort(),
    componentPackageMap,
    components,
  };

  fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');

  const pct = Math.round((withProps / components.length) * 100);
  console.log(`✅ Synced ${components.length} components → ${path.relative(repoRoot, outPath)}`);
  console.log(`   ${withProps} components with typed props (${pct}%), ${totalProps} props total.`);
  console.log(`   Packages: ${out.packages.join(', ')}`);
}

main();
