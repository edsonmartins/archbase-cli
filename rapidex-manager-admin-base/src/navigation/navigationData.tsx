import React from 'react';
import { ArchbaseNavigationItem } from 'archbase-react';
import { IconDashboard, IconUsers, IconSettings, IconBuilding } from '@tabler/icons-react';
import DashboardPage from '../pages/DashboardPage';
import UsersPage from '../pages/users/UsersPage';
import UserDetailsPage from '../pages/users/UserDetailsPage';
import SettingsPage from '../pages/settings/SettingsPage';
import { TenantView } from '../views/tenants/TenantView';
import { TenantForm } from '../views/tenants/TenantForm';

export const navigationData: ArchbaseNavigationItem[] = [
  {
    label: 'rapidex-manager-admin-base:Dashboard',
    icon: <IconDashboard size={20} />,
    link: '/dashboard',
    category: 'MAIN',
    component: <DashboardPage />,
    showInSidebar: true,
    color: 'blue'
  },
  {
    label: 'rapidex-manager-admin-base:Usuários',
    icon: <IconUsers size={20} />,
    link: '/users',
    category: 'ADMIN',
    component: <UsersPage />,
    showInSidebar: true,
    color: 'green'
  },
  {
    label: 'rapidex-manager-admin-base:Detalhes do Usuário',
    icon: <IconUsers size={20} />,
    link: '/users/:id',
    category: 'ADMIN',
    component: <UserDetailsPage />,
    showInSidebar: false,
    redirect: '/users',
    customTitle: "Usuário: $title",
    color: 'green'
  },
  {
    label: 'rapidex-manager-admin-base:Tenants',
    icon: <IconBuilding size={20} />,
    link: '/tenants',
    category: 'ADMIN',
    component: <TenantView />,
    showInSidebar: true,
    color: 'purple'
  },
  {
    label: 'rapidex-manager-admin-base:Detalhes do Tenant',
    icon: <IconBuilding size={20} />,
    link: '/tenants/:id',
    category: 'ADMIN',
    component: <TenantForm />,
    showInSidebar: false,
    redirect: '/tenants',
    customTitle: "Tenant: $title",
    color: 'purple'
  },
  {
    label: 'rapidex-manager-admin-base:Configurações',
    icon: <IconSettings size={20} />,
    link: '/settings',
    category: 'SYSTEM',
    component: <SettingsPage />,
    showInSidebar: true,
    color: 'gray'
  }
];