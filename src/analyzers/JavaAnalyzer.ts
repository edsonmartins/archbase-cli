export interface JavaMethod {
  name: string;
  returnType: string;
  parameters: JavaParameter[];
  annotations: JavaAnnotation[];
  modifiers: string[];
}

export interface JavaParameter {
  name: string;
  type: string;
  annotations: JavaAnnotation[];
}

export interface JavaAnnotation {
  name: string;
  value?: string;
  attributes?: Record<string, string>;
}

export interface JavaControllerAnalysis {
  className: string;
  baseMapping?: string;
  methods: JavaMethod[];
}

export class JavaAnalyzer {
  async analyzeController(javaCode: string): Promise<JavaControllerAnalysis> {
    const analysis: JavaControllerAnalysis = {
      className: '',
      methods: []
    };

    // Extract class name
    const classMatch = javaCode.match(/class\s+(\w+)/);
    if (classMatch) {
      analysis.className = classMatch[1];
    }

    // Extract base mapping from @RequestMapping
    const requestMappingMatch = javaCode.match(/@RequestMapping\s*\(\s*["']([^"']+)["']\s*\)/);
    if (requestMappingMatch) {
      analysis.baseMapping = requestMappingMatch[1];
    }

    // First, normalize the code by removing line breaks in method signatures
    const normalizedCode = javaCode.replace(/\n\s+@/g, '\n@').replace(/\)\s*\n\s*\{/g, ') {');

    // Extract methods - improved regex to handle more complex return types
    // Split into lines and process method by method
    const lines = normalizedCode.split('\n');
    let currentMethod = '';
    let inMethod = false;
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this is a method declaration
      if (line.includes('public') || line.includes('private') || line.includes('protected')) {
        if (line.includes('(') && !line.includes('class')) {
          currentMethod = line;
          
          // Check if parameters span multiple lines
          if (!line.includes(')')) {
            let j = i + 1;
            while (j < lines.length && !lines[j].includes(')')) {
              currentMethod += ' ' + lines[j].trim();
              j++;
            }
            if (j < lines.length) {
              currentMethod += ' ' + lines[j].trim();
              i = j;
            }
          }
          
          // Parse the method
          const methodMatch = currentMethod.match(/(@[\s\S]*?)?\s*(public|protected|private)?\s*([\w.]+(?:<[\w\s,.<>?\[\]]+>)?(?:\[\])?)\s+(\w+)\s*\(([^)]*)\)/);
          
          if (methodMatch) {
            const annotations = this.extractAnnotations(methodMatch[1] || '');
            const modifiers = methodMatch[2] ? [methodMatch[2]] : ['public'];
            const returnType = methodMatch[3];
            const methodName = methodMatch[4];
            const parametersString = methodMatch[5];

            // Skip constructors
            if (methodName !== analysis.className) {
              const method: JavaMethod = {
                name: methodName,
                returnType,
                parameters: this.parseParameters(parametersString),
                annotations,
                modifiers
              };

              analysis.methods.push(method);
            }
          }
        }
      }
    }

    return analysis;
  }

  private extractAnnotations(annotationString: string): JavaAnnotation[] {
    const annotations: JavaAnnotation[] = [];
    const annotationRegex = /@(\w+)(?:\s*\(([^)]*)\))?/g;
    let match;

    while ((match = annotationRegex.exec(annotationString)) !== null) {
      const annotation: JavaAnnotation = {
        name: match[1]
      };

      if (match[2]) {
        // Parse annotation value/attributes
        const value = match[2].trim();
        
        // Simple value (e.g., @GetMapping("/users"))
        if (value.startsWith('"') || value.startsWith("'")) {
          annotation.value = value.replace(/['"]/g, '');
        } 
        // Complex attributes (e.g., @RequestParam(value = "id", required = false))
        else if (value.includes('=')) {
          annotation.attributes = this.parseAttributes(value);
        }
        // Array value (e.g., @GetMapping({"/users", "/pessoas"}))
        else if (value.startsWith('{')) {
          annotation.value = value.replace(/[{}]/g, '').split(',')[0].trim().replace(/['"]/g, '');
        }
      }

      annotations.push(annotation);
    }

    return annotations;
  }

  private parseParameters(parametersString: string): JavaParameter[] {
    if (!parametersString.trim()) return [];

    const parameters: JavaParameter[] = [];
    const params = this.splitParameters(parametersString);

    for (const param of params) {
      const paramTrimmed = param.trim();
      if (!paramTrimmed) continue;

      // Extract annotations
      const annotationMatches = paramTrimmed.match(/(@\w+(?:\s*\([^)]*\))?)/g);
      const annotations = annotationMatches ? 
        annotationMatches.map(a => this.extractAnnotations(a)[0]).filter(Boolean) : [];

      // Remove annotations from parameter string
      let cleanParam = paramTrimmed;
      if (annotationMatches) {
        annotationMatches.forEach(a => {
          cleanParam = cleanParam.replace(a, '');
        });
      }
      cleanParam = cleanParam.trim();

      // Parse type and name
      const parts = cleanParam.split(/\s+/);
      if (parts.length >= 2) {
        const name = parts[parts.length - 1];
        const type = parts.slice(0, -1).join(' ');

        parameters.push({
          name,
          type: this.normalizeType(type),
          annotations
        });
      }
    }

    return parameters;
  }

  private splitParameters(parametersString: string): string[] {
    const params: string[] = [];
    let current = '';
    let depth = 0;

    for (let i = 0; i < parametersString.length; i++) {
      const char = parametersString[i];

      if (char === '<' || char === '(') depth++;
      else if (char === '>' || char === ')') depth--;
      else if (char === ',' && depth === 0) {
        params.push(current.trim());
        current = '';
        continue;
      }

      current += char;
    }

    if (current.trim()) {
      params.push(current.trim());
    }

    return params;
  }

  private parseAttributes(attributeString: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    const attrRegex = /(\w+)\s*=\s*["']?([^"',]+)["']?/g;
    let match;

    while ((match = attrRegex.exec(attributeString)) !== null) {
      attributes[match[1]] = match[2];
    }

    return attributes;
  }

  private normalizeType(type: string): string {
    // Remove final keyword
    type = type.replace(/\bfinal\s+/g, '');
    
    // Normalize common Java types
    const typeMap: Record<string, string> = {
      'java.lang.String': 'String',
      'java.lang.Integer': 'Integer',
      'java.lang.Long': 'Long',
      'java.lang.Boolean': 'Boolean',
      'java.util.List': 'List',
      'java.util.Set': 'Set',
      'java.util.Map': 'Map',
      'java.util.Date': 'Date',
      'java.time.LocalDate': 'LocalDate',
      'java.time.LocalDateTime': 'LocalDateTime'
    };

    for (const [fullType, shortType] of Object.entries(typeMap)) {
      if (type.includes(fullType)) {
        type = type.replace(fullType, shortType);
      }
    }

    return type;
  }
}

export default JavaAnalyzer;