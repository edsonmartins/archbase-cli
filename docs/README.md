# Documentação do Archbase CLI

Esta pasta contém a documentação completa do Archbase CLI.

## Documentos Disponíveis

### Funcionalidades Principais
- [archbase_cli_spec.md](./archbase_cli_spec.md) - Especificação completa do CLI
- [development-context.md](./development-context.md) - Contexto de desenvolvimento e arquitetura
- [compilation-and-distribution.md](./compilation-and-distribution.md) - Guia de compilação, empacotamento e distribuição

### Funcionalidades Avançadas
- [advanced-scanning.md](./advanced-scanning.md) - Sistema avançado de scanning e análise de componentes
- [migration-tools.md](./migration-tools.md) - Ferramentas de migração automática entre versões
- [advanced-features.md](./advanced-features.md) - Funcionalidades avançadas, AST analysis e integração CI/CD

### Boilerplates e Templates
- [remote-boilerplates.md](./remote-boilerplates.md) - Suporte para boilerplates remotos (Git/npm)
- [custom-boilerplates.md](./custom-boilerplates.md) - Criação de boilerplates customizados

### Sistema de Plugins
- [plugin-development.md](./plugin-development.md) - Guia completo de desenvolvimento de plugins
- [plugin-system.md](./plugin-system.md) - Arquitetura e funcionamento do sistema de plugins
- [plugin-examples.md](./plugin-examples.md) - Exemplos práticos de implementação

### Contexto de Desenvolvimento
- [archbase-cli-development-context.md](./archbase-cli-development-context.md) - Contexto detalhado do desenvolvimento

## Estrutura da Documentação

### Para Usuários
1. **Início Rápido**: Consulte o README.md principal
2. **Especificação Completa**: [archbase_cli_spec.md](./archbase_cli_spec.md)
3. **Funcionalidades Avançadas**: [advanced-features.md](./advanced-features.md)

### Para Desenvolvedores
1. **Contexto de Desenvolvimento**: [development-context.md](./development-context.md)
2. **Arquitetura AST**: [advanced-features.md](./advanced-features.md)
3. **Sistema de Migration**: [migration-tools.md](./migration-tools.md)

### Para DevOps
1. **Sistema de Scanning**: [advanced-scanning.md](./advanced-scanning.md)
2. **Integração CI/CD**: [advanced-features.md](./advanced-features.md)
3. **Boilerplates Remotos**: [remote-boilerplates.md](./remote-boilerplates.md)

## Roadmap da Documentação

### ✅ Completo
- [x] Especificação básica do CLI
- [x] Sistema de scanning avançado
- [x] Ferramentas de migração
- [x] Boilerplates remotos e customizados
- [x] Funcionalidades avançadas e integração CI/CD

### 📋 Próximos Passos
- [x] Sistema de plugins extensível
- [ ] Guias de troubleshooting detalhados
- [ ] Tutoriais práticos step-by-step
- [ ] API reference completa
- [ ] Performance benchmarks
- [ ] Marketplace de plugins oficial

## Contribuição

Para contribuir com a documentação:

1. **Formato**: Use Markdown com syntax highlighting
2. **Estrutura**: Mantenha consistência com documentos existentes
3. **Exemplos**: Inclua exemplos práticos e código funcional
4. **Screenshots**: Use text-based outputs quando possível para compatibility

## Convenções

### Comandos
```bash
# Sempre inclua comentários explicativos
archbase generate form UserForm --dto ./UserDto.ts
```

### Código
```typescript
// Use syntax highlighting apropriado
interface ComponentUsage {
  name: string;
  version: 'v1' | 'v2';
}
```

### Status
- ✅ Implementado e testado
- 🚧 Em desenvolvimento
- 📋 Planejado
- ❌ Descontinuado

A documentação do Archbase CLI é mantida atualizada com o desenvolvimento e reflete as funcionalidades mais recentes da ferramenta.