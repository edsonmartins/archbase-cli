#!/bin/bash

# 🚀 {{projectName}} - Setup Script
# Este script automatiza a configuração inicial do projeto

echo "🔥 {{projectName}} - SETUP"
echo "================================="
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js 16+ antes de continuar."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js versão 16+ é necessária. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Detectar gerenciador de pacotes
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
    echo "✅ pnpm detectado - usando pnpm"
elif command -v yarn &> /dev/null; then
    PKG_MANAGER="yarn"
    echo "✅ yarn detectado - usando yarn"
else
    PKG_MANAGER="npm"
    echo "✅ npm detectado - usando npm"
fi

echo ""
echo "📦 Instalando dependências..."
$PKG_MANAGER install

echo ""
echo "🔍 Verificando TypeScript..."
$PKG_MANAGER run type-check

echo ""
echo "🎉 Setup concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   $PKG_MANAGER run dev     # Iniciar servidor de desenvolvimento"
echo "   $PKG_MANAGER run build   # Build para produção"
echo "   $PKG_MANAGER run test    # Executar testes"
echo ""
echo "📖 Mais informações no README.md"