/**
 * Idempotent project wiring for `create module`.
 *
 * After a feature's files are generated, these helpers wire it into an existing
 * Archbase project: barrels, the IOC types + container, and navigation route
 * constants. Every function is safe to re-run (it checks before inserting) and
 * degrades gracefully when the target file is absent (returns `skipped`).
 */
import * as fs from 'fs-extra';
import * as path from 'path';
import { globSync } from 'glob';

export interface WiringResult {
  /** Human-readable target (file path or directory). */
  target: string;
  action: 'patched' | 'created' | 'skipped';
  reason?: string;
}

/** Resolve the project's IOC types module name (e.g. 'IOCTypes', 'RapidexIOCTypes'). */
export function resolveIocTypesName(base: string): string {
  const matches = globSync(path.join(base, 'ioc', '*IOCTypes.ts'));
  return matches.length > 0 ? path.basename(matches[0], '.ts') : 'IOCTypes';
}

/** Create or extend a barrel file with the given export lines (idempotent). */
export async function writeBarrel(filePath: string, exportLines: string[]): Promise<WiringResult> {
  const existed = await fs.pathExists(filePath);
  const current = existed ? await fs.readFile(filePath, 'utf-8') : '';
  const missing = exportLines.filter(line => !current.includes(line));
  if (missing.length === 0) {
    return { target: filePath, action: 'skipped', reason: 'exports already present' };
  }
  const prefix = current && !current.endsWith('\n') ? current + '\n' : current;
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, prefix + missing.join('\n') + '\n');
  return { target: filePath, action: existed ? 'patched' : 'created' };
}

/** Add `Entity: Symbol.for('EntityService'),` to the API_TYPE object (idempotent). */
export async function patchIocTypes(base: string, entityName: string): Promise<WiringResult> {
  const matches = globSync(path.join(base, 'ioc', '*IOCTypes.ts'));
  if (matches.length === 0) {
    return { target: path.join(base, 'ioc'), action: 'skipped', reason: 'no *IOCTypes.ts found' };
  }
  const file = matches[0];
  let content = await fs.readFile(file, 'utf-8');
  if (new RegExp(`\\n\\s*${entityName}\\s*:`).test(content)) {
    return { target: file, action: 'skipped', reason: `${entityName} already declared` };
  }
  const entry = `  ${entityName}: Symbol.for('${entityName}Service'),`;
  const apiTypeBlock = /(export const API_TYPE\s*=\s*\{[\s\S]*?)(\n\};?)/;
  if (!apiTypeBlock.test(content)) {
    return { target: file, action: 'skipped', reason: 'could not locate API_TYPE object' };
  }
  content = content.replace(apiTypeBlock, `$1\n${entry}$2`);
  await fs.writeFile(file, content);
  return { target: file, action: 'patched' };
}

/** Add the service import + `container.bind(...).to(...)` registration (idempotent). */
export async function patchIocContainer(base: string, serviceName: string, entityName: string): Promise<WiringResult> {
  const matches = globSync(path.join(base, 'ioc', '*ContainerIOC.ts'));
  if (matches.length === 0) {
    return { target: path.join(base, 'ioc'), action: 'skipped', reason: 'no *ContainerIOC.ts found' };
  }
  const file = matches[0];
  let content = await fs.readFile(file, 'utf-8');
  if (content.includes(`API_TYPE.${entityName}`)) {
    return { target: file, action: 'skipped', reason: `${serviceName} already registered` };
  }

  // Insert the service import after the last existing import statement. Anchor on
  // the import's `from` clause so a multi-line `import {\n A,\n B\n} from '...'`
  // isn't split in the middle.
  const serviceImport = `import { ${serviceName} } from "../services/${serviceName}";`;
  if (!content.includes(serviceImport)) {
    const lastImport = content.lastIndexOf('\nimport ');
    const fromIdx = content.indexOf('from', lastImport + 1);
    const anchor = fromIdx !== -1 ? fromIdx : lastImport + 1;
    let lineEnd = content.indexOf('\n', anchor);
    if (lineEnd === -1) lineEnd = content.length;
    content = content.slice(0, lineEnd + 1) + serviceImport + '\n' + content.slice(lineEnd + 1);
  }

  // Insert the binding after the last container.bind(...).to(...); statement.
  const binding = `\ncontainer\n  .bind<${serviceName}>(API_TYPE.${entityName})\n  .to(${serviceName});\n`;
  const bindingPattern = /container\s*\n\s*\.bind[\s\S]*?\.to\([^)]*\);/g;
  let last: RegExpExecArray | null = null;
  let m: RegExpExecArray | null;
  while ((m = bindingPattern.exec(content)) !== null) last = m;
  if (last) {
    const at = last.index + last[0].length;
    content = content.slice(0, at) + '\n' + binding + content.slice(at);
  } else {
    content = content.trimEnd() + '\n' + binding;
  }
  await fs.writeFile(file, content);
  return { target: file, action: 'patched' };
}

export interface NavDataOptions {
  entity: string;
  feature: string;
  featureConstant: string;
  viewName: string;
  formName?: string;
}

/**
 * Build the lazy import(s) + navigation item snippet for a feature, matching the
 * project's existing import-path style (`@views/...` vs `../views/...`).
 */
export function buildNavDataSnippet(content: string, opts: NavDataOptions): string {
  const alias = content.includes('@views/') ? '@views' : '../views';
  const importPath = `${alias}/${opts.feature}`;
  const lazyLines = [
    `const ${opts.viewName} = lazy(() => import("${importPath}").then((m) => ({ default: m.${opts.viewName} })))`,
  ];
  if (opts.formName) {
    lazyLines.push(`const ${opts.formName} = lazy(() => import("${importPath}").then((m) => ({ default: m.${opts.formName} })))`);
  }
  const navItem =
    `  {\n` +
    `    label: '${opts.entity}',\n` +
    `    link: ${opts.featureConstant}_ROUTE,\n` +
    `    component: withSuspense(<${opts.viewName} />),\n` +
    `    showInSidebar: true,\n` +
    `  },`;
  return `${lazyLines.join('\n')}\n\n${navItem}`;
}

/**
 * Insert the feature's lazy imports + a navigation item into navigationData,
 * but only at an explicit `// @archbase-cli:navitems` marker (the nested menu
 * array shape is project-specific, so unguarded edits are unsafe). When the
 * marker is absent the function returns `skipped` and the caller prints the
 * ready-to-paste snippet instead. Always returns the snippet.
 */
export async function patchNavData(
  base: string,
  opts: NavDataOptions,
): Promise<WiringResult & { snippet: string }> {
  const matches = globSync(path.join(base, 'navigation', 'navigationData.{ts,tsx}'));
  if (matches.length === 0) {
    const snippet = buildNavDataSnippet('', opts);
    return { target: path.join(base, 'navigation'), action: 'skipped', reason: 'no navigationData file found', snippet };
  }
  const file = matches[0];
  let content = await fs.readFile(file, 'utf-8');
  const snippet = buildNavDataSnippet(content, opts);

  if (content.includes(`m.${opts.viewName} }`) || content.includes(`<${opts.viewName} />`)) {
    return { target: file, action: 'skipped', reason: `${opts.viewName} already wired`, snippet };
  }

  const MARKER = '// @archbase-cli:navitems';
  if (!content.includes(MARKER)) {
    return {
      target: file,
      action: 'skipped',
      reason: `no ${MARKER} marker — paste the snippet manually (see next steps)`,
      snippet,
    };
  }

  const [lazyBlock, navItem] = snippet.split('\n\n');

  // Lazy imports: insert right after the last existing `= lazy(` line.
  const lastLazy = content.lastIndexOf('= lazy(');
  if (lastLazy !== -1) {
    const lineEnd = content.indexOf('\n', lastLazy);
    content = content.slice(0, lineEnd + 1) + lazyBlock + '\n' + content.slice(lineEnd + 1);
  } else {
    content = lazyBlock + '\n' + content;
  }

  // Navigation item: insert just before the marker line.
  content = content.replace(new RegExp(`([ \\t]*)${MARKER}`), `${navItem}\n$1${MARKER}`);

  await fs.writeFile(file, content);
  return { target: file, action: 'patched', snippet };
}

/** Append `{FEATURE}_ROUTE` / `{FEATURE}_FORM_ROUTE` route constants (idempotent). */
export async function patchNavConstants(
  base: string,
  featureConstant: string,
  route: string,
): Promise<WiringResult> {
  const matches = globSync(path.join(base, 'navigation', '*Constants.{ts,tsx}'));
  if (matches.length === 0) {
    return { target: path.join(base, 'navigation'), action: 'skipped', reason: 'no navigation *Constants file found' };
  }
  const file = matches[0];
  let content = await fs.readFile(file, 'utf-8');
  if (new RegExp(`\\b${featureConstant}_ROUTE\\b`).test(content)) {
    return { target: file, action: 'skipped', reason: `${featureConstant}_ROUTE already declared` };
  }
  const lines = [
    `export const ${featureConstant}_ROUTE = '${route}';`,
    `export const ${featureConstant}_FORM_ROUTE = '${route}/:id';`,
  ];
  const prefix = content.endsWith('\n') ? content : content + '\n';
  await fs.writeFile(file, prefix + lines.join('\n') + '\n');
  return { target: file, action: 'patched' };
}
