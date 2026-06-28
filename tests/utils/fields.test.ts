/**
 * Tests for the shared field-spec parser used by `create module`.
 */

import { describe, it, expect } from 'vitest';
import { parseFieldSpecs } from '../../src/utils/fields';

describe('parseFieldSpecs', () => {
  it('parses name and type, defaulting type to text and required to false', () => {
    expect(parseFieldSpecs('name,price:number')).toEqual([
      { name: 'name', type: 'text', required: false },
      { name: 'price', type: 'number', required: false },
    ]);
  });

  it('honors the explicit :required token', () => {
    expect(parseFieldSpecs('email:text:required,age:number:req')).toEqual([
      { name: 'email', type: 'text', required: true },
      { name: 'age', type: 'number', required: true },
    ]);
  });

  it('honors the trailing ! shorthand on the field name', () => {
    expect(parseFieldSpecs('email!,nickname')).toEqual([
      { name: 'email', type: 'text', required: true },
      { name: 'nickname', type: 'text', required: false },
    ]);
  });

  it('ignores empty entries and whitespace', () => {
    expect(parseFieldSpecs(' name : text , , price:number ')).toEqual([
      { name: 'name', type: 'text', required: false },
      { name: 'price', type: 'number', required: false },
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(parseFieldSpecs('')).toEqual([]);
    expect(parseFieldSpecs('   ')).toEqual([]);
  });
});
