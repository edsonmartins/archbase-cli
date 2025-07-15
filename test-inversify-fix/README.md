# test-inversify-fix

Project generated with Archbase CLI

## 🚀 Início Rápido

### Pré-requisitos

- Node.js >= 16.0.0
- npm >= 8.0.0
- Docker (opcional)

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar em modo de desenvolvimento
npm run dev
```

### Configuração

Edite o arquivo `.env` com suas configurações:

```env
VITE_API=http://localhost:3001/api
VITE_APP_NAME=Admin Dashboard
```

## 📁 Estrutura do Projeto

```
test-inversify-fix/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/         # Páginas da aplicação
│   ├── layouts/       # Layouts (sidebar, header)
│   ├── hooks/         # Custom React hooks
│   ├── services/      # Serviços de API
│   ├── store/         # Estado global (Zustand)
│   ├── utils/         # Funções utilitárias
│   ├── types/         # Tipos TypeScript
│   └── styles/        # Estilos globais
├── public/            # Assets públicos
└── tests/            # Testes unitários e E2E
```

## 🛠️ Funcionalidades

### ✅ Autenticação
- Login/Logout
- Proteção de rotas
- Gerenciamento de sessão
- Refresh token automático


### ✅ Dashboard
- Métricas em tempo real
- Gráficos interativos
- Widgets customizáveis
- Exportação de dados




## 📚 Tecnologias Utilizadas

- **React 18** - Interface do usuário
- **TypeScript** - Type safety
- **Archbase React** - Componentes UI
- **React Router** - Roteamento
- **React Query** - Gerenciamento de estado do servidor
- **Zustand** - Estado global
- **Tailwind CSS** - Estilização
- **Vite** - Build tool
- **Recharts** - Gráficos
- **Vitest** - Testes unitários
- **Testing Library** - Testes de componentes

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com interface
npm run test:ui

# Coverage
npm run test:coverage
```

## 🚀 Deploy

### Build de Produção

```bash
# Build
npm run build

# Preview local
npm run preview
```

### Docker

```bash
# Build da imagem
docker build -t test-inversify-fix .

# Executar container
docker run -p 3000:3000 test-inversify-fix
```

### Docker Compose

```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar serviços
docker-compose down
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build
- `npm run lint` - Verifica erros de lint
- `npm run format` - Formata código com Prettier
- `npm test` - Executa testes
- `npm run test:ui` - Testes com interface
- `npm run test:coverage` - Relatório de cobertura
- `npm run type-check` - Verifica tipos TypeScript

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- 📧 Email: support@archbase.com
- 💬 Discord: [Archbase Community](https://discord.gg/archbase)
- 📖 Docs: [Archbase Documentation](https://docs.archbase.com)

---

Desenvolvido com ❤️ usando [Archbase CLI](https://github.com/archbase/cli)