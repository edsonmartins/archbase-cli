/**
 * CodeValidator tests — the archbase-imports rule.
 *
 * Public API: validateCode(code, fileName?) returns a synchronous ValidationResult;
 * validateFile(path) is the async file-reading wrapper. The archbase-imports rule
 * accepts BOTH the V3 modular packages (@archbase/*) and the legacy `archbase-react`
 * monolith, and only errors when Archbase components are used with no archbase import.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import { CodeValidator } from '../../src/validators/CodeValidator';
import { makeTempDir, cleanupDir } from '../helpers';

const MISSING_IMPORT_MSG = 'Missing @archbase/* import for Archbase components';

const importErrors = (result: { errors: { type: string; message: string }[] }) =>
  result.errors.filter((e) => e.type === 'import').map((e) => e.message);

describe('CodeValidator — archbase imports rule', () => {
  let validator: CodeValidator;

  beforeEach(() => {
    validator = new CodeValidator();
  });

  it('accepts a TSX file importing ArchbaseEdit from @archbase/components', () => {
    const code = `
      import React from 'react';
      import { ArchbaseEdit } from '@archbase/components';

      export default function MyForm() {
        return <ArchbaseEdit dataField="name" />;
      }
    `;
    const result = validator.validateCode(code, 'MyForm.tsx');
    expect(importErrors(result)).not.toContain(MISSING_IMPORT_MSG);
  });

  it('still accepts the legacy archbase-react monolith import', () => {
    const code = `
      import React from 'react';
      import { ArchbaseEdit } from 'archbase-react';

      export default function MyForm() {
        return <ArchbaseEdit dataField="name" />;
      }
    `;
    const result = validator.validateCode(code, 'MyForm.tsx');
    expect(importErrors(result)).not.toContain(MISSING_IMPORT_MSG);
  });

  it('reports a missing-import error when an Archbase component has no archbase import', () => {
    const code = `
      import React from 'react';

      export default function MyForm() {
        return <ArchbaseEdit dataField="name" />;
      }
    `;
    const result = validator.validateCode(code, 'MyForm.tsx');
    expect(importErrors(result)).toContain(MISSING_IMPORT_MSG);
    expect(result.isValid).toBe(false);
  });

  it('does not require an archbase import when no Archbase component is used', () => {
    const code = `
      import React from 'react';

      export default function Plain() {
        return <div>hello</div>;
      }
    `;
    const result = validator.validateCode(code, 'Plain.tsx');
    expect(importErrors(result)).not.toContain(MISSING_IMPORT_MSG);
  });

  it('validateFile reads from disk and applies the same rule', async () => {
    const tempDir = await makeTempDir();
    try {
      const file = path.join(tempDir, 'Good.tsx');
      await fs.writeFile(
        file,
        `import React from 'react';
         import { ArchbaseEdit } from '@archbase/components';
         export default function Good() { return <ArchbaseEdit dataField="x" />; }`
      );
      const result = await validator.validateFile(file);
      expect(importErrors(result)).not.toContain(MISSING_IMPORT_MSG);
    } finally {
      await cleanupDir(tempDir);
    }
  });
});
