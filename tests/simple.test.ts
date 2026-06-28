/**
 * Smoke tests for CodeValidator against V3 (@archbase/*) source snippets.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CodeValidator } from '../src/validators/CodeValidator';

describe('CodeValidator smoke tests', () => {
  let validator: CodeValidator;

  beforeEach(() => {
    validator = new CodeValidator();
  });

  it('validates a TSX snippet that imports from @archbase/components', () => {
    const code = `
import React from 'react';
import { ArchbaseEdit } from '@archbase/components';

interface CustomerFormProps {
  name: string;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ name }) => {
  return <ArchbaseEdit dataField="name" placeholder={name} />;
};

export default CustomerForm;
`;

    const result = validator.validateCode(code);

    expect(result.isValid).toBe(true);
    expect(result.errors.filter(e => e.type === 'import')).toHaveLength(0);
    expect(result.metrics.hasTypeScript).toBe(true);
  });

  it('flags Archbase components used without an @archbase/* import', () => {
    const code = `
import React from 'react';

const BrokenForm: React.FC = () => {
  return <ArchbaseEdit dataField="name" />;
};

export default BrokenForm;
`;

    const result = validator.validateCode(code);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some(e => e.message.toLowerCase().includes('archbase'))).toBe(true);
  });
});
