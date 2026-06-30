/**
 * Tests for the shared field-spec parser used by `create module`.
 */

import { describe, it, expect } from 'vitest';
import { parseFieldSpecs, toPascalCase, enumTypeName } from '../../src/utils/fields';

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

  it('parses enum fields with pipe-separated values', () => {
    expect(parseFieldSpecs('status:enum:ATIVO|INATIVO|PENDENTE')).toEqual([
      { name: 'status', type: 'enum', required: false, enumValues: ['ATIVO', 'INATIVO', 'PENDENTE'] },
    ]);
  });

  it('normalizes enum member names to UPPER_SNAKE', () => {
    const [field] = parseFieldSpecs('priority:enum:low priority|high-priority');
    expect(field.enumValues).toEqual(['LOW_PRIORITY', 'HIGH_PRIORITY']);
  });
});

describe('toPascalCase / enumTypeName', () => {
  it('PascalCases simple and separated identifiers', () => {
    expect(toPascalCase('status')).toBe('Status');
    expect(toPascalCase('order_status')).toBe('OrderStatus');
    expect(toPascalCase('order-status')).toBe('OrderStatus');
    expect(toPascalCase('order status')).toBe('OrderStatus');
  });

  it('derives the entity-qualified enum type name (single source of truth)', () => {
    // The DTO generator and the form generator both call this, so they agree.
    expect(enumTypeName('Product', 'status')).toBe('ProductStatus');
    expect(enumTypeName('Order', 'payment_type')).toBe('OrderPaymentType');
  });
});
