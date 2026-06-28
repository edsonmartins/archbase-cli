/**
 * Shared parsing for comma-separated field specs used by `create module`.
 *
 * Each entry is `name[:type[:required]]`, e.g. `email:text:required`. The type
 * defaults to `text`; a field is required when the third token is
 * `required`/`req`/`!`, or when the name ends with `!` (e.g. `email!`).
 */
export interface ParsedFieldSpec {
  name: string;
  type: string;
  required: boolean;
}

export function parseFieldSpecs(csv: string): ParsedFieldSpec[] {
  if (!csv || !csv.trim()) {
    return [];
  }

  return csv
    .split(',')
    .map((raw) => {
      const [namePart, typePart = 'text', flagPart] = raw.trim().split(':');
      let name = namePart.trim();
      let required = false;

      if (name.endsWith('!')) {
        required = true;
        name = name.slice(0, -1).trim();
      }

      const flag = (flagPart || '').trim().toLowerCase();
      if (flag === 'required' || flag === 'req' || flag === '!') {
        required = true;
      }

      return { name, type: typePart.trim(), required };
    })
    .filter((field) => field.name.length > 0);
}
