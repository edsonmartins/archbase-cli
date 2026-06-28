/**
 * JavaAnalyzer tests — extraction of controller metadata from Java source.
 *
 * Public API: analyzeController(javaCode: string): Promise<JavaControllerAnalysis>
 * Returns { className, baseMapping?, methods: JavaMethod[] } where each method
 * carries { name, returnType, parameters, annotations, modifiers }.
 *
 * Note: the analyzer only captures method-level annotations when they sit on the
 * SAME line as the access modifier (e.g. `@GetMapping public ... foo()`), which is
 * how the sample controller below is written.
 */

import { describe, it, expect } from 'vitest';
import { JavaAnalyzer } from '../../src/analyzers/JavaAnalyzer';

const CONTROLLER = `
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    @GetMapping public List<ProductDto> findAll() { return null; }

    @GetMapping("/{id}") public ProductDto findById(@PathVariable Long id) { return null; }

    @PostMapping public ProductDto create(@RequestBody ProductDto dto) { return null; }

    @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { }
}
`;

describe('JavaAnalyzer', () => {
  it('extracts the controller class name', async () => {
    const analysis = await new JavaAnalyzer().analyzeController(CONTROLLER);
    expect(analysis.className).toBe('ProductController');
  });

  it('extracts the base @RequestMapping path', async () => {
    const analysis = await new JavaAnalyzer().analyzeController(CONTROLLER);
    expect(analysis.baseMapping).toBe('/api/v1/products');
  });

  it('extracts every endpoint method (skipping the constructor)', async () => {
    const analysis = await new JavaAnalyzer().analyzeController(CONTROLLER);
    const names = analysis.methods.map((m) => m.name);
    expect(names).toEqual(['findAll', 'findById', 'create', 'delete']);
  });

  it('maps each method to its HTTP-verb annotation', async () => {
    const analysis = await new JavaAnalyzer().analyzeController(CONTROLLER);
    const verbOf = (name: string) =>
      analysis.methods.find((m) => m.name === name)!.annotations.map((a) => a.name);

    expect(verbOf('findAll')).toContain('GetMapping');
    expect(verbOf('findById')).toContain('GetMapping');
    expect(verbOf('create')).toContain('PostMapping');
    expect(verbOf('delete')).toContain('DeleteMapping');
  });

  it('captures the sub-path value of an annotated mapping', async () => {
    const analysis = await new JavaAnalyzer().analyzeController(CONTROLLER);
    const findById = analysis.methods.find((m) => m.name === 'findById')!;
    const getMapping = findById.annotations.find((a) => a.name === 'GetMapping')!;
    expect(getMapping.value).toBe('/{id}');
  });

  it('extracts method return types', async () => {
    const analysis = await new JavaAnalyzer().analyzeController(CONTROLLER);
    const returnOf = (name: string) =>
      analysis.methods.find((m) => m.name === name)!.returnType;

    expect(returnOf('findAll')).toBe('List<ProductDto>');
    expect(returnOf('findById')).toBe('ProductDto');
    expect(returnOf('delete')).toBe('void');
  });

  it('extracts parameters with their type and annotations', async () => {
    const analysis = await new JavaAnalyzer().analyzeController(CONTROLLER);

    const findById = analysis.methods.find((m) => m.name === 'findById')!;
    expect(findById.parameters).toHaveLength(1);
    expect(findById.parameters[0].name).toBe('id');
    expect(findById.parameters[0].type).toBe('Long');
    expect(findById.parameters[0].annotations.map((a) => a.name)).toContain('PathVariable');

    const create = analysis.methods.find((m) => m.name === 'create')!;
    expect(create.parameters[0].type).toBe('ProductDto');
    expect(create.parameters[0].annotations.map((a) => a.name)).toContain('RequestBody');
  });

  it('marks methods as public', async () => {
    const analysis = await new JavaAnalyzer().analyzeController(CONTROLLER);
    expect(analysis.methods.every((m) => m.modifiers.includes('public'))).toBe(true);
  });
});
