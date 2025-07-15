# test-postcss-fix - Archbase React Project

## Installation

```bash
# Install dependencies
npm install

# Or with yarn
yarn install

# Or with pnpm
pnpm install
```

## Development

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Build for production
npm run build
```

## Project Configuration

This project includes all necessary dependencies for Archbase React development:

### Core Dependencies
- **archbase-react**: Component library
- **@mantine/core**: UI components (v8.x)
- **React**: ^18.3.1
- **TypeScript**: Full type safety
- **Vite**: Fast build tool

### Project Type: basic

### Additional Features
- security-management
- api-token-management
- dashboard
- authentication

## Mantine Configuration

The project is pre-configured with Mantine 8.x:
- PostCSS configuration included
- Theme provider setup
- All necessary CSS imports
- Responsive breakpoints configured

## Getting Started

1. Import the AppProvider in your main.tsx:

```tsx
import { AppProvider } from './providers/AppProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
)
```

2. Start using Archbase components:

```tsx
import { ArchbaseEdit } from 'archbase-react';
import { Button } from '@mantine/core'

function MyComponent() {
  return (
    <div>
      <ArchbaseEdit label="Name" />
      <Button>Submit</Button>
    </div>
  )
}
```

## Documentation

- [Archbase React Docs](https://react.archbase.com.br)
- [Mantine Docs](https://mantine.dev)
- [Vite Docs](https://vitejs.dev)
