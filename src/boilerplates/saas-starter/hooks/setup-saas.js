#!/usr/bin/env node

/**
 * SaaS Starter Setup Script
 * 
 * This script runs after project creation to set up the SaaS application
 * with multitenancy, authentication, billing, and other features.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up your SaaS application...\n');

async function setupSaaS() {
  try {
    // Read the configuration from the generated files
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const projectName = packageJson.name;

    console.log(`🏗️  Setting up ${projectName}...`);

    // Create necessary directories
    const directories = [
      'src/assets/images/auth',
      'src/assets/images/billing',
      'src/assets/images/dashboard', 
      'src/assets/images/landing',
      'src/assets/icons',
      'public/uploads/avatars',
      'public/uploads/documents',
      'docs/api',
      'docs/multitenancy',
      'docs/billing',
      'docs/deployment',
      'logs',
      'backups',
      'scripts'
    ];

    console.log('📁 Creating directory structure...');
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`   ✓ ${dir}`);
      }
    });

    // Create configuration files
    console.log('\n⚙️  Creating configuration files...');

    // SaaS Configuration
    const saasConfig = `export const saasConfig = {
  app: {
    name: '${projectName}',
    version: '0.1.0',
    environment: process.env.NODE_ENV || 'development'
  },
  
  multitenancy: {
    model: process.env.TENANT_ISOLATION_MODE || 'single-db',
    defaultTenant: process.env.DEFAULT_TENANT || 'main',
    maxTenantsPerUser: parseInt(process.env.MAX_TENANTS_PER_USER || '5'),
    maxUsersPerTenant: parseInt(process.env.MAX_USERS_PER_TENANT || '100')
  },
  
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '30'),
    passwordPolicy: {
      minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
      requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
      requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
      requireSymbols: process.env.PASSWORD_REQUIRE_SYMBOLS === 'true'
    }
  },
  
  billing: {
    currency: process.env.BILLING_CURRENCY || 'USD',
    trialDays: parseInt(process.env.TRIAL_DAYS || '14'),
    gracePeriodDays: parseInt(process.env.GRACE_PERIOD_DAYS || '3'),
    invoicePrefix: process.env.INVOICE_PREFIX || 'INV-'
  },
  
  features: {
    authentication: true,
    multitenancy: true,
    subscriptionBilling: true,
    userManagement: true,
    dashboardAnalytics: true,
    teamCollaboration: true,
    settingsConfiguration: true,
    apiManagement: process.env.FEATURE_API_MANAGEMENT === 'true',
    supportSystem: process.env.FEATURE_SUPPORT_SYSTEM === 'true',
    emailCampaigns: process.env.FEATURE_EMAIL_CAMPAIGNS === 'true',
    auditLogs: process.env.FEATURE_AUDIT_LOGS === 'true',
    whiteLabel: process.env.FEATURE_WHITE_LABEL === 'true'
  },
  
  limits: {
    fileUpload: {
      maxSize: parseInt(process.env.VITE_MAX_FILE_SIZE || '10485760'), // 10MB
      allowedTypes: (process.env.VITE_ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf').split(',')
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
    }
  }
};`;

    fs.writeFileSync('src/config/saas.ts', saasConfig);
    console.log('   ✓ SaaS configuration');

    // Subscription Plans Configuration
    const plansConfig = `export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    users: number;
    storage: string;
    apiCalls: number;
    projects: number;
  };
  popular?: boolean;
  stripePriceId?: string;
  paddlePlanId?: string;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    description: 'Ideal para começar e explorar a plataforma',
    price: 0,
    interval: 'month',
    features: [
      'Até 5 usuários',
      'Armazenamento básico',
      'Suporte por email',
      'Recursos básicos'
    ],
    limits: {
      users: 5,
      storage: '1GB',
      apiCalls: 1000,
      projects: 3
    }
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Para equipes pequenas e projetos em crescimento',
    price: 29,
    interval: 'month',
    features: [
      'Até 25 usuários',
      'Armazenamento expandido',
      'Suporte prioritário',
      'Analytics básico',
      'Integrações limitadas'
    ],
    limits: {
      users: 25,
      storage: '10GB',
      apiCalls: 10000,
      projects: 10
    },
    stripePriceId: 'price_starter_monthly',
    paddlePlanId: 'starter_monthly'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Para equipes profissionais com necessidades avançadas',
    price: 99,
    interval: 'month',
    features: [
      'Até 100 usuários',
      'Armazenamento premium',
      'Suporte 24/7',
      'Analytics avançado',
      'Todas as integrações',
      'API completa',
      'Relatórios customizados'
    ],
    limits: {
      users: 100,
      storage: '100GB',
      apiCalls: 100000,
      projects: 50
    },
    popular: true,
    stripePriceId: 'price_professional_monthly',
    paddlePlanId: 'professional_monthly'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para grandes organizações com necessidades específicas',
    price: 299,
    interval: 'month',
    features: [
      'Usuários ilimitados',
      'Armazenamento ilimitado',
      'Suporte dedicado',
      'SLA garantido',
      'White-label',
      'SSO/SAML',
      'Auditoria completa',
      'Onboarding personalizado'
    ],
    limits: {
      users: -1, // Unlimited
      storage: 'Unlimited',
      apiCalls: -1,
      projects: -1
    },
    stripePriceId: 'price_enterprise_monthly',
    paddlePlanId: 'enterprise_monthly'
  }
];

export const getFeaturesByPlan = (planId: string): string[] => {
  const plan = subscriptionPlans.find(p => p.id === planId);
  return plan?.features || [];
};

export const canAccessFeature = (userPlan: string, feature: string): boolean => {
  const plan = subscriptionPlans.find(p => p.id === userPlan);
  return plan?.features.includes(feature) || false;
};

export const isWithinLimits = (userPlan: string, usage: any): boolean => {
  const plan = subscriptionPlans.find(p => p.id === userPlan);
  if (!plan) return false;
  
  const { limits } = plan;
  
  // Check user limit
  if (limits.users !== -1 && usage.users > limits.users) return false;
  
  // Check API calls limit
  if (limits.apiCalls !== -1 && usage.apiCalls > limits.apiCalls) return false;
  
  // Check projects limit
  if (limits.projects !== -1 && usage.projects > limits.projects) return false;
  
  return true;
};`;

    fs.writeFileSync('src/config/plans.ts', plansConfig);
    console.log('   ✓ Subscription plans configuration');

    // Tenant Context
    const tenantContext = `import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: 'active' | 'suspended' | 'canceled';
  subscription?: {
    id: string;
    status: 'active' | 'past_due' | 'canceled' | 'trialing';
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  };
  branding?: {
    logo?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
    customDomain?: string;
  };
  limits: {
    users: number;
    storage: string;
    apiCalls: number;
    projects: number;
  };
  usage: {
    users: number;
    storageUsed: number;
    apiCallsUsed: number;
    projectsUsed: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface TenantContextType {
  tenant: TenantInfo | null;
  tenants: TenantInfo[];
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenant: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTenants = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/tenants', {
        headers: {
          'Authorization': \`Bearer \${localStorage.getItem('token')}\`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load tenants');
      }
      
      const data = await response.json();
      setTenants(data.tenants);
      
      // Set current tenant from localStorage or use first available
      const currentTenantId = localStorage.getItem('currentTenantId');
      const currentTenant = data.tenants.find((t: TenantInfo) => t.id === currentTenantId) || data.tenants[0];
      
      if (currentTenant) {
        setTenant(currentTenant);
        localStorage.setItem('currentTenantId', currentTenant.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const switchTenant = async (tenantId: string) => {
    const newTenant = tenants.find(t => t.id === tenantId);
    if (newTenant) {
      setTenant(newTenant);
      localStorage.setItem('currentTenantId', tenantId);
    }
  };

  const refreshTenant = async () => {
    if (tenant) {
      try {
        const response = await fetch(\`/api/tenants/\${tenant.id}\`, {
          headers: {
            'Authorization': \`Bearer \${localStorage.getItem('token')}\`
          }
        });
        
        if (response.ok) {
          const updatedTenant = await response.json();
          setTenant(updatedTenant);
          
          // Update in tenants list
          setTenants(prev => prev.map(t => t.id === tenant.id ? updatedTenant : t));
        }
      } catch (err) {
        console.error('Failed to refresh tenant:', err);
      }
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  return (
    <TenantContext.Provider value={{
      tenant,
      tenants,
      switchTenant,
      refreshTenant,
      isLoading,
      error
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const useSubscriptionLimits = () => {
  const { tenant } = useTenant();
  
  if (!tenant) {
    return {
      canAddUser: false,
      canCreateProject: false,
      canMakeApiCall: false,
      hasFeature: () => false,
      isAtLimit: () => true
    };
  }
  
  return {
    canAddUser: tenant.limits.users === -1 || tenant.usage.users < tenant.limits.users,
    canCreateProject: tenant.limits.projects === -1 || tenant.usage.projectsUsed < tenant.limits.projects,
    canMakeApiCall: tenant.limits.apiCalls === -1 || tenant.usage.apiCallsUsed < tenant.limits.apiCalls,
    hasFeature: (feature: string) => {
      const plan = subscriptionPlans.find(p => p.id === tenant.plan);
      return plan?.features.includes(feature) || false;
    },
    isAtLimit: (resource: 'users' | 'projects' | 'apiCalls') => {
      const limit = tenant.limits[resource];
      const usage = resource === 'users' ? tenant.usage.users : 
                   resource === 'projects' ? tenant.usage.projectsUsed : 
                   tenant.usage.apiCallsUsed;
      
      return limit !== -1 && usage >= limit;
    }
  };
};`;

    fs.writeFileSync('src/contexts/TenantContext.tsx', tenantContext);
    console.log('   ✓ Tenant context and hooks');

    // Auth Configuration
    const authConfig = `export const authConfig = {
  providers: {
    email: {
      enabled: true,
      requireEmailVerification: true
    },
    google: {
      enabled: process.env.GOOGLE_CLIENT_ID !== undefined,
      clientId: process.env.GOOGLE_CLIENT_ID
    },
    github: {
      enabled: process.env.GITHUB_CLIENT_ID !== undefined,
      clientId: process.env.GITHUB_CLIENT_ID
    },
    microsoft: {
      enabled: process.env.MICROSOFT_CLIENT_ID !== undefined,
      clientId: process.env.MICROSOFT_CLIENT_ID
    },
    saml: {
      enabled: process.env.SAML_ENTRY_POINT !== undefined,
      entryPoint: process.env.SAML_ENTRY_POINT
    }
  },
  
  security: {
    passwordPolicy: {
      minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
      requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
      requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
      requireSymbols: process.env.PASSWORD_REQUIRE_SYMBOLS === 'true'
    },
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '30'), // minutes
    maxLoginAttempts: 5,
    lockoutDuration: 15 // minutes
  },
  
  redirects: {
    afterLogin: '/dashboard',
    afterLogout: '/',
    afterRegister: '/onboarding',
    afterPasswordReset: '/login'
  }
};

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin', 
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export enum Permission {
  // User management
  USER_INVITE = 'user:invite',
  USER_MANAGE = 'user:manage',
  USER_DELETE = 'user:delete',
  
  // Billing
  BILLING_VIEW = 'billing:view',
  BILLING_MANAGE = 'billing:manage',
  
  // Settings
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_MANAGE = 'settings:manage',
  
  // Data
  DATA_READ = 'data:read',
  DATA_WRITE = 'data:write',
  DATA_DELETE = 'data:delete',
  
  // API
  API_MANAGE = 'api:manage',
  
  // Reports
  REPORTS_VIEW = 'reports:view',
  REPORTS_EXPORT = 'reports:export'
}

export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.OWNER]: [
    Permission.USER_INVITE,
    Permission.USER_MANAGE,
    Permission.USER_DELETE,
    Permission.BILLING_VIEW,
    Permission.BILLING_MANAGE,
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_MANAGE,
    Permission.DATA_READ,
    Permission.DATA_WRITE,
    Permission.DATA_DELETE,
    Permission.API_MANAGE,
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT
  ],
  [UserRole.ADMIN]: [
    Permission.USER_INVITE,
    Permission.USER_MANAGE,
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_MANAGE,
    Permission.DATA_READ,
    Permission.DATA_WRITE,
    Permission.DATA_DELETE,
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT
  ],
  [UserRole.MEMBER]: [
    Permission.DATA_READ,
    Permission.DATA_WRITE,
    Permission.REPORTS_VIEW
  ],
  [UserRole.VIEWER]: [
    Permission.DATA_READ,
    Permission.REPORTS_VIEW
  ]
};

export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return rolePermissions[userRole]?.includes(permission) || false;
};`;

    fs.writeFileSync('src/config/auth.ts', authConfig);
    console.log('   ✓ Authentication configuration');

    // Create sample data
    console.log('\n📊 Creating sample data...');

    // Sample tenants
    const sampleTenants = [
      {
        id: '1',
        name: 'Acme Corp',
        slug: 'acme-corp',
        plan: 'professional',
        status: 'active',
        subscription: {
          id: 'sub_1234567890',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false
        },
        limits: {
          users: 100,
          storage: '100GB',
          apiCalls: 100000,
          projects: 50
        },
        usage: {
          users: 12,
          storageUsed: 25600000000, // 25.6GB in bytes
          apiCallsUsed: 15420,
          projectsUsed: 8
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'StartupXYZ',
        slug: 'startup-xyz',
        plan: 'starter',
        status: 'active',
        subscription: {
          id: 'sub_0987654321',
          status: 'trialing',
          currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false
        },
        limits: {
          users: 25,
          storage: '10GB',
          apiCalls: 10000,
          projects: 10
        },
        usage: {
          users: 5,
          storageUsed: 2147483648, // 2GB in bytes
          apiCallsUsed: 1250,
          projectsUsed: 3
        },
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date()
      }
    ];

    fs.writeFileSync('src/data/tenants.json', JSON.stringify(sampleTenants, null, 2));
    console.log('   ✓ Sample tenants');

    // Sample users
    const sampleUsers = [
      {
        id: '1',
        email: 'john@acme-corp.com',
        name: 'John Doe',
        role: 'owner',
        tenantId: '1',
        avatar: '/avatars/john-doe.jpg',
        status: 'active',
        lastLoginAt: new Date(),
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        email: 'jane@acme-corp.com',
        name: 'Jane Smith',
        role: 'admin',
        tenantId: '1',
        avatar: '/avatars/jane-smith.jpg',
        status: 'active',
        lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date('2024-01-20')
      },
      {
        id: '3',
        email: 'bob@startup-xyz.com',
        name: 'Bob Johnson',
        role: 'owner',
        tenantId: '2',
        status: 'active',
        lastLoginAt: new Date(Date.now() - 30 * 60 * 1000),
        createdAt: new Date('2024-02-01')
      }
    ];

    fs.writeFileSync('src/data/users.json', JSON.stringify(sampleUsers, null, 2));
    console.log('   ✓ Sample users');

    // Create basic utilities
    console.log('\n🔧 Creating utility functions...');

    const utilsAuth = `import { UserRole, Permission, hasPermission } from '../config/auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  lastLoginAt?: Date;
  createdAt: Date;
}

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentTenantId');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const userHasPermission = (permission: Permission): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return hasPermission(user.role, permission);
};

export const userHasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};

export const isOwner = (): boolean => userHasRole(UserRole.OWNER);
export const isAdmin = (): boolean => userHasRole(UserRole.ADMIN);
export const isMember = (): boolean => userHasRole(UserRole.MEMBER);
export const isViewer = (): boolean => userHasRole(UserRole.VIEWER);

export const canManageUsers = (): boolean => userHasPermission(Permission.USER_MANAGE);
export const canManageBilling = (): boolean => userHasPermission(Permission.BILLING_MANAGE);
export const canManageSettings = (): boolean => userHasPermission(Permission.SETTINGS_MANAGE);`;

    fs.writeFileSync('src/utils/auth.ts', utilsAuth);
    console.log('   ✓ Auth utilities');

    const utilsBilling = `import { SubscriptionPlan, subscriptionPlans } from '../config/plans';

export const formatPrice = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatUsage = (used: number, limit: number): string => {
  if (limit === -1) return \`\${used.toLocaleString()} / Unlimited\`;
  return \`\${used.toLocaleString()} / \${limit.toLocaleString()}\`;
};

export const getUsagePercentage = (used: number, limit: number): number => {
  if (limit === -1) return 0;
  return Math.min((used / limit) * 100, 100);
};

export const isUsageNearLimit = (used: number, limit: number, threshold: number = 0.8): boolean => {
  if (limit === -1) return false;
  return (used / limit) >= threshold;
};

export const getPlanById = (planId: string): SubscriptionPlan | undefined => {
  return subscriptionPlans.find(plan => plan.id === planId);
};

export const getNextPlan = (currentPlanId: string): SubscriptionPlan | null => {
  const currentIndex = subscriptionPlans.findIndex(plan => plan.id === currentPlanId);
  if (currentIndex === -1 || currentIndex === subscriptionPlans.length - 1) return null;
  return subscriptionPlans[currentIndex + 1];
};

export const getPreviousPlan = (currentPlanId: string): SubscriptionPlan | null => {
  const currentIndex = subscriptionPlans.findIndex(plan => plan.id === currentPlanId);
  if (currentIndex <= 0) return null;
  return subscriptionPlans[currentIndex - 1];
};

export const calculateProratedAmount = (
  currentPlan: SubscriptionPlan,
  newPlan: SubscriptionPlan,
  daysRemaining: number
): number => {
  const daysInMonth = 30;
  const currentDailyRate = currentPlan.price / daysInMonth;
  const newDailyRate = newPlan.price / daysInMonth;
  
  const refund = currentDailyRate * daysRemaining;
  const newCharge = newDailyRate * daysRemaining;
  
  return Math.max(0, newCharge - refund);
};

export const formatStorageSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const parseStorageSize = (storage: string): number => {
  if (storage === 'Unlimited' || storage === 'unlimited') return -1;
  
  const match = storage.match(/^(\d+(?:\.\d+)?)\s*(GB|MB|KB|TB)$/i);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  
  const multipliers = {
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024
  };
  
  return value * (multipliers[unit] || 1);
};`;

    fs.writeFileSync('src/utils/billing.ts', utilsBilling);
    console.log('   ✓ Billing utilities');

    // Create Mock Service Worker setup for development
    console.log('\n🔧 Setting up development tools...');

    const mockSetup = `import { setupWorker } from 'msw';
import { authHandlers } from './handlers/auth';
import { tenantHandlers } from './handlers/tenant';
import { billingHandlers } from './handlers/billing';
import { userHandlers } from './handlers/user';

export const worker = setupWorker(
  ...authHandlers,
  ...tenantHandlers,
  ...billingHandlers,
  ...userHandlers
);

if (process.env.NODE_ENV === 'development' && process.env.VITE_MOCK_API === 'true') {
  worker.start({
    onUnhandledRequest: 'bypass',
  });
}`;

    if (!fs.existsSync('src/mocks')) {
      fs.mkdirSync('src/mocks', { recursive: true });
    }
    fs.writeFileSync('src/mocks/browser.ts', mockSetup);

    // Create auth handlers
    const authHandlers = `import { rest } from 'msw';
import users from '../../data/users.json';
import tenants from '../../data/tenants.json';

export const authHandlers = [
  // Login
  rest.post('/api/auth/login', async (req, res, ctx) => {
    const { email, password } = await req.json();
    
    // Simple mock authentication
    const user = users.find(u => u.email === email);
    
    if (!user || password !== 'password123') {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Invalid credentials' })
      );
    }
    
    const token = 'mock-jwt-token-' + user.id;
    
    return res(
      ctx.json({
        user,
        token,
        expiresIn: 7 * 24 * 60 * 60 // 7 days
      })
    );
  }),

  // Register
  rest.post('/api/auth/register', async (req, res, ctx) => {
    const { email, password, name, company } = await req.json();
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'User already exists' })
      );
    }
    
    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      role: 'owner',
      tenantId: Date.now().toString(),
      status: 'active',
      createdAt: new Date()
    };
    
    const newTenant = {
      id: newUser.tenantId,
      name: company || \`\${name}'s Organization\`,
      slug: (company || name).toLowerCase().replace(/\s+/g, '-'),
      plan: 'free',
      status: 'active',
      limits: {
        users: 5,
        storage: '1GB',
        apiCalls: 1000,
        projects: 3
      },
      usage: {
        users: 1,
        storageUsed: 0,
        apiCallsUsed: 0,
        projectsUsed: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const token = 'mock-jwt-token-' + newUser.id;
    
    return res(
      ctx.json({
        user: newUser,
        tenant: newTenant,
        token,
        expiresIn: 7 * 24 * 60 * 60
      })
    );
  }),

  // Logout
  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),

  // Forgot password
  rest.post('/api/auth/forgot-password', async (req, res, ctx) => {
    const { email } = await req.json();
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'User not found' })
      );
    }
    
    return res(
      ctx.json({ 
        message: 'Password reset email sent',
        resetToken: 'mock-reset-token'
      })
    );
  }),

  // Reset password
  rest.post('/api/auth/reset-password', async (req, res, ctx) => {
    const { token, password } = await req.json();
    
    if (token !== 'mock-reset-token') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Invalid reset token' })
      );
    }
    
    return res(
      ctx.json({ message: 'Password reset successfully' })
    );
  }),

  // Verify token
  rest.get('/api/auth/me', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !token.startsWith('mock-jwt-token-')) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Invalid token' })
      );
    }
    
    const userId = token.replace('mock-jwt-token-', '');
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'User not found' })
      );
    }
    
    return res(ctx.json(user));
  })
];`;

    if (!fs.existsSync('src/mocks/handlers')) {
      fs.mkdirSync('src/mocks/handlers', { recursive: true });
    }
    fs.writeFileSync('src/mocks/handlers/auth.ts', authHandlers);
    console.log('   ✓ Mock API handlers');

    // Create basic CSS
    console.log('\n🎨 Setting up styles...');

    const globalStyles = `/* SaaS Global Styles */
:root {
  /* Colors */
  --color-primary: #6366f1;
  --color-secondary: #8b5cf6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;
  --color-light: #f8fafc;
  --color-dark: #1e293b;
  
  /* Layout */
  --header-height: 64px;
  --sidebar-width: 256px;
  --content-max-width: 1200px;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Borders */
  --border-radius: 0.5rem;
  --border-radius-sm: 0.25rem;
  --border-radius-lg: 0.75rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  
  /* Transitions */
  --transition: all 0.2s ease;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
  line-height: 1.6;
  color: var(--color-dark);
  background-color: var(--color-light);
}

/* Layout Components */
.saas-header {
  height: var(--header-height);
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: var(--shadow-sm);
}

.saas-sidebar {
  width: var(--sidebar-width);
  background: white;
  border-right: 1px solid #e2e8f0;
  box-shadow: var(--shadow-sm);
}

.saas-main-content {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--spacing-lg);
}

/* Dashboard Cards */
.metric-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  transition: var(--transition);
}

.metric-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-1px);
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.metric-label {
  font-size: var(--font-size-sm);
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Tenant Indicator */
.tenant-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-primary);
  color: white;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

/* Plan Badges */
.plan-free { background: #6b7280; }
.plan-starter { background: #059669; }
.plan-professional { background: var(--color-primary); }
.plan-enterprise { background: #7c3aed; }

/* Usage Bars */
.usage-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}

.usage-fill {
  height: 100%;
  background: var(--color-primary);
  transition: var(--transition);
}

.usage-fill.near-limit {
  background: var(--color-warning);
}

.usage-fill.at-limit {
  background: var(--color-danger);
}

/* Billing Components */
.price-display {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-dark);
}

.price-period {
  font-size: var(--font-size-lg);
  color: #64748b;
  font-weight: 400;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-list li {
  display: flex;
  align-items: center;
  padding: var(--spacing-xs) 0;
}

.feature-list li::before {
  content: '✓';
  color: var(--color-success);
  font-weight: bold;
  margin-right: var(--spacing-sm);
}

/* Responsive Design */
@media (max-width: 768px) {
  :root {
    --header-height: 56px;
    --sidebar-width: 280px;
  }
  
  .saas-main-content {
    padding: var(--spacing-md);
  }
  
  .metric-card {
    padding: var(--spacing-md);
  }
  
  .price-display {
    font-size: 2rem;
  }
}

@media (max-width: 640px) {
  .saas-main-content {
    padding: var(--spacing-sm);
  }
}

/* Loading States */
.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Animations */
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.slide-in-right {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}`;

    fs.writeFileSync('src/styles/globals.css', globalStyles);
    console.log('   ✓ Global styles');

    // Create .gitignore
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

# Coverage directory
coverage/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache
.cache
.parcel-cache

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Uploads
public/uploads/
src/assets/uploads/

# Database
*.sqlite
*.db

# Backups
backups/

# SaaS specific
tenant-data/
billing-exports/`;

    fs.writeFileSync('.gitignore', gitignore);
    console.log('   ✓ .gitignore');

    // Final success message
    console.log('\n🎉 SaaS application setup completed successfully!\n');
    
    console.log('📋 Next steps:');
    console.log('   1. Copy .env.example to .env and configure your settings');
    console.log('   2. Set up your database and Redis (if using)');
    console.log('   3. Configure authentication providers (Google, GitHub, etc.)');
    console.log('   4. Set up billing integration (Stripe, Paddle, etc.)');
    console.log('   5. Configure email provider (SendGrid, Mailgun, etc.)');
    console.log('   6. Run npm run dev to start development');
    console.log('   7. Visit http://localhost:3000 to see your SaaS app\n');
    
    console.log('🔐 Default login credentials (development):');
    console.log('   Email: john@acme-corp.com');
    console.log('   Password: password123\n');
    
    console.log('📚 Documentation:');
    console.log('   - README.md - Complete setup guide');
    console.log('   - docs/multitenancy.md - Multitenancy guide');
    console.log('   - docs/billing.md - Billing integration guide');
    console.log('   - docs/api.md - API documentation\n');
    
    console.log('🚀 Your SaaS application is ready to scale!');

  } catch (error) {
    console.error('❌ Error setting up SaaS application:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupSaaS();