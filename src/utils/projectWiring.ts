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

  // Insert the service import after the last existing import line.
  const serviceImport = `import { ${serviceName} } from "../services/${serviceName}";`;
  if (!content.includes(serviceImport)) {
    const lastImport = content.lastIndexOf('\nimport ');
    const lineEnd = content.indexOf('\n', lastImport + 1);
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
