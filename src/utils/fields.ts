/**
 * Shared parsing for comma-separated field specs used by `create module`.
 *
 * Each entry is `name[:type[:required]]`, e.g. `email:text:required`. The type
 * defaults to `text`; a field is required when the third token is
 * `required`/`req`/`!`, or when the name ends with `!` (e.g. `email!`).
 *
 * Enum fields use the third token for the pipe-separated values instead of the
 * required flag: `status:enum:ATIVO|INATIVO|PENDENTE`.
 */
export interface ParsedFieldSpec {
  name: string;
  type: string;
  required: boolean;
  /** For enum fields: the parsed enum member names (UPPER_SNAKE). */
  enumValues?: string[];
}

function toEnumMember(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
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

      const type = typePart.trim();

      if (type === 'enum') {
        // Third token holds the enum values, not the required flag.
        const enumValues = (flagPart || '')
          .split('|')
          .map(toEnumMember)
          .filter(Boolean);
        return { name, type, required, enumValues };
      }

      const flag = (flagPart || '').trim().toLowerCase();
      if (flag === 'required' || flag === 'req' || flag === '!') {
        required = true;
      }

      return { name, type, required };
    })
    .filter((field) => field.name.length > 0);
}
