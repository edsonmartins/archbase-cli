#!/usr/bin/env node

/**
 * Marketplace Setup Script
 * 
 * This script runs after project creation to set up the marketplace
 * with the user's chosen configuration.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🛍️  Setting up your marketplace...\n');

async function setupMarketplace() {
  try {
    // Read the configuration from the generated files
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const projectName = packageJson.name;

    console.log(`📦 Setting up ${projectName}...`);

    // Create necessary directories
    const directories = [
      'src/assets/images/products',
      'src/assets/images/vendors',
      'src/assets/images/categories',
      'src/assets/images/banners',
      'public/uploads',
      'docs/api',
      'docs/vendor-guide',
      'docs/admin-guide',
      'logs'
    ];

    console.log('📁 Creating directory structure...');
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`   ✓ ${dir}`);
      }
    });

    // Create sample data files
    console.log('\n📊 Creating sample data files...');
    
    // Sample categories
    const categories = [
      { id: '1', name: 'Eletrônicos', slug: 'eletronicos', parent: null },
      { id: '2', name: 'Smartphones', slug: 'smartphones', parent: '1' },
      { id: '3', name: 'Laptops', slug: 'laptops', parent: '1' },
      { id: '4', name: 'Roupas', slug: 'roupas', parent: null },
      { id: '5', name: 'Masculino', slug: 'masculino', parent: '4' },
      { id: '6', name: 'Feminino', slug: 'feminino', parent: '4' },
      { id: '7', name: 'Casa e Jardim', slug: 'casa-jardim', parent: null },
      { id: '8', name: 'Móveis', slug: 'moveis', parent: '7' },
      { id: '9', name: 'Decoração', slug: 'decoracao', parent: '7' }
    ];

    fs.writeFileSync(
      'src/data/categories.json',
      JSON.stringify(categories, null, 2)
    );
    console.log('   ✓ Sample categories created');

    // Sample vendors
    const vendors = [
      {
        id: '1',
        name: 'TechStore',
        slug: 'techstore',
        description: 'Especializada em eletrônicos',
        email: 'contato@techstore.com',
        phone: '(11) 9999-9999',
        rating: 4.8,
        totalSales: 1250,
        verified: true,
        commission: 0.05
      },
      {
        id: '2',
        name: 'Moda Brasil',
        slug: 'moda-brasil',
        description: 'Roupas e acessórios nacionais',
        email: 'vendas@modabrasil.com',
        phone: '(21) 8888-8888',
        rating: 4.6,
        totalSales: 890,
        verified: true,
        commission: 0.08
      }
    ];

    fs.writeFileSync(
      'src/data/vendors.json',
      JSON.stringify(vendors, null, 2)
    );
    console.log('   ✓ Sample vendors created');

    // Sample products
    const products = [
      {
        id: '1',
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'Smartphone Apple com câmera profissional',
        price: 7999.99,
        salePrice: 7499.99,
        categoryId: '2',
        vendorId: '1',
        stock: 25,
        sku: 'IPH15PRO-256-TIT',
        images: ['/images/products/iphone-15-pro-1.jpg'],
        rating: 4.9,
        reviewCount: 156,
        status: 'active',
        featured: true
      },
      {
        id: '2',
        name: 'MacBook Pro M3',
        slug: 'macbook-pro-m3',
        description: 'Laptop profissional com chip M3',
        price: 12999.99,
        categoryId: '3',
        vendorId: '1',
        stock: 12,
        sku: 'MBP-M3-14-512',
        images: ['/images/products/macbook-pro-m3-1.jpg'],
        rating: 4.8,
        reviewCount: 89,
        status: 'active',
        featured: true
      }
    ];

    fs.writeFileSync(
      'src/data/products.json',
      JSON.stringify(products, null, 2)
    );
    console.log('   ✓ Sample products created');

    // Create configuration files
    console.log('\n⚙️  Creating configuration files...');

    // Marketplace config
    const marketplaceConfig = `export const marketplaceConfig = {
  name: '${projectName}',
  currency: 'BRL',
  locale: 'pt-BR',
  timezone: 'America/Sao_Paulo',
  commission: {
    default: 0.05,
    categories: {
      electronics: 0.03,
      fashion: 0.08,
      books: 0.10
    }
  },
  shipping: {
    freeThreshold: 100,
    defaultWeight: 0.5,
    dimensions: {
      length: 20,
      width: 15,
      height: 10
    }
  },
  features: {
    multiVendor: true,
    reviews: true,
    wishlist: true,
    recommendations: true,
    analytics: true
  }
};`;

    fs.writeFileSync('src/config/marketplace.ts', marketplaceConfig);
    console.log('   ✓ Marketplace configuration');

    // Payment config
    const paymentConfig = `export const paymentConfig = {
  providers: {
    stripe: {
      enabled: process.env.VITE_STRIPE_PUBLIC_KEY !== undefined,
      publicKey: process.env.VITE_STRIPE_PUBLIC_KEY,
      currency: 'BRL',
      methods: ['card', 'pix']
    },
    pagseguro: {
      enabled: process.env.PAGSEGURO_EMAIL !== undefined,
      sandbox: process.env.PAGSEGURO_SANDBOX === 'true',
      methods: ['creditCard', 'debitCard', 'pix', 'boleto']
    }
  },
  supportedCurrencies: ['BRL', 'USD', 'EUR'],
  defaultCurrency: 'BRL'
};`;

    fs.writeFileSync('src/config/payment.ts', paymentConfig);
    console.log('   ✓ Payment configuration');

    // Create API mock data for development
    console.log('\n🔧 Setting up development tools...');

    const mockServerConfig = `import { setupWorker } from 'msw';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

if (process.env.NODE_ENV === 'development' && process.env.VITE_MOCK_API === 'true') {
  worker.start({
    onUnhandledRequest: 'bypass',
  });
}`;

    if (!fs.existsSync('src/mocks')) {
      fs.mkdirSync('src/mocks', { recursive: true });
    }
    fs.writeFileSync('src/mocks/browser.ts', mockServerConfig);
    console.log('   ✓ Mock service worker setup');

    // Create basic handlers
    const handlersTemplate = `import { rest } from 'msw';
import products from '../data/products.json';
import categories from '../data/categories.json';
import vendors from '../data/vendors.json';

export const handlers = [
  // Products
  rest.get('/api/products', (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page')) || 1;
    const limit = Number(req.url.searchParams.get('limit')) || 20;
    const category = req.url.searchParams.get('category');
    const search = req.url.searchParams.get('search');

    let filteredProducts = products;

    if (category) {
      filteredProducts = products.filter(p => p.categoryId === category);
    }

    if (search) {
      filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const pageProducts = filteredProducts.slice(start, end);

    return res(
      ctx.json({
        data: pageProducts,
        pagination: {
          page,
          limit,
          total: filteredProducts.length,
          totalPages: Math.ceil(filteredProducts.length / limit)
        }
      })
    );
  }),

  rest.get('/api/products/:id', (req, res, ctx) => {
    const { id } = req.params;
    const product = products.find(p => p.id === id);
    
    if (!product) {
      return res(ctx.status(404), ctx.json({ error: 'Product not found' }));
    }

    return res(ctx.json(product));
  }),

  // Categories
  rest.get('/api/categories', (req, res, ctx) => {
    return res(ctx.json(categories));
  }),

  // Vendors
  rest.get('/api/vendors', (req, res, ctx) => {
    return res(ctx.json(vendors));
  }),

  rest.get('/api/vendors/:id', (req, res, ctx) => {
    const { id } = req.params;
    const vendor = vendors.find(v => v.id === id);
    
    if (!vendor) {
      return res(ctx.status(404), ctx.json({ error: 'Vendor not found' }));
    }

    return res(ctx.json(vendor));
  }),

  // Cart
  rest.get('/api/cart', (req, res, ctx) => {
    return res(ctx.json({
      items: [],
      total: 0,
      itemCount: 0,
      shipping: 0,
      tax: 0,
      grandTotal: 0
    }));
  }),

  rest.post('/api/cart/items', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),

  // Orders
  rest.get('/api/orders', (req, res, ctx) => {
    return res(ctx.json([]));
  }),

  rest.post('/api/orders', (req, res, ctx) => {
    return res(ctx.json({
      id: 'order-' + Date.now(),
      status: 'pending',
      total: 0,
      createdAt: new Date().toISOString()
    }));
  })
];`;

    fs.writeFileSync('src/mocks/handlers.ts', handlersTemplate);
    console.log('   ✓ API mock handlers');

    // Create essential CSS files
    console.log('\n🎨 Setting up styles...');

    const globalStyles = `/* Global Marketplace Styles */
:root {
  --color-primary: #e74c3c;
  --color-secondary: #3498db;
  --color-success: #2ecc71;
  --color-warning: #f39c12;
  --color-danger: #e74c3c;
  --color-info: #3498db;
  --color-light: #ecf0f1;
  --color-dark: #2c3e50;
  
  --header-height: 80px;
  --sidebar-width: 280px;
  --footer-height: 200px;
  --container-max-width: 1200px;
  
  --border-radius: 8px;
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --transition: all 0.2s ease;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.6;
  color: var(--color-dark);
}

/* Marketplace specific styles */
.marketplace-header {
  height: var(--header-height);
  border-bottom: 1px solid var(--color-light);
}

.marketplace-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 20px;
}

.product-card {
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  transition: var(--transition);
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.vendor-badge {
  background: var(--color-primary);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.price {
  font-weight: 600;
  color: var(--color-primary);
}

.price-original {
  text-decoration: line-through;
  color: #999;
  margin-left: 8px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-stars {
  color: #ffd700;
}

/* Responsive */
@media (max-width: 768px) {
  .marketplace-container {
    padding: 0 16px;
  }
  
  :root {
    --header-height: 60px;
  }
}`;

    fs.writeFileSync('src/styles/globals.css', globalStyles);
    console.log('   ✓ Global styles created');

    // Create a simple .gitignore
    const gitignore = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production
/dist/
/build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# Test coverage
coverage/

# Uploads
public/uploads/
src/assets/uploads/

# Database
*.sqlite
*.db`;

    fs.writeFileSync('.gitignore', gitignore);
    console.log('   ✓ .gitignore created');

    // Final success message
    console.log('\n🎉 Marketplace setup completed successfully!\n');
    
    console.log('📋 Next steps:');
    console.log('   1. Copy .env.example to .env and configure your settings');
    console.log('   2. Set up your database and run migrations');
    console.log('   3. Configure payment gateways (Stripe, PagSeguro, etc.)');
    console.log('   4. Run npm run dev to start development');
    console.log('   5. Visit http://localhost:3000 to see your marketplace\n');
    
    console.log('📚 Documentation:');
    console.log('   - README.md - Complete setup guide');
    console.log('   - docs/vendor-guide.md - Guide for vendors');
    console.log('   - docs/admin-guide.md - Administration guide');
    console.log('   - docs/api.md - API documentation\n');
    
    console.log('🛍️  Happy selling! Your marketplace is ready to go.');

  } catch (error) {
    console.error('❌ Error setting up marketplace:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupMarketplace();