import React, { useState } from 'react';
import {
  ArchbaseNavigation,
  ArchbaseNavigationItem,
  isAdministrator,
  hasPermission
} from '@archbase/react';
import {
  IconDashboard,
  IconUsers,
  IconShoppingCart,
  IconPackage,
  IconSettings,
  IconReports,
  IconChevronDown,
  IconUser,
  IconUserCheck,
  IconUserCog,
  IconBox,
  IconCategory,
  IconTags,
  IconFileText,
  IconChartBar,
  IconCog,
  IconDatabase
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';

// Navigation data structure
const navigationData: ArchbaseNavigationItem[] = [
  {
    id: 'dashboard',
    label: 'mentors:navigation.dashboard',
    icon: IconDashboard,
    route: '/admin/dashboard',
    visible: true,
    showInSidebar: true
  },
  {
    id: 'users',
    label: 'mentors:navigation.users',
    icon: IconUsers,
    visible: isAdministrator(),
    showInSidebar: true,
    children: [
      {
        id: 'users-list',
        label: 'mentors:navigation.users.list',
        icon: IconUser,
        route: '/admin/usuarios/usuario',
        visible: hasPermission('users.read'),
        showInSidebar: true
      },
      {
        id: 'users-form',
        label: 'mentors:navigation.users.form',
        icon: IconUserCheck,
        route: '/admin/usuarios/usuario/:usuarioId',
        visible: hasPermission('users.write'),
        showInSidebar: false // Forms hidden from sidebar
      },
      {
        id: 'users-roles',
        label: 'mentors:navigation.users.roles',
        icon: IconUserCog,
        route: '/admin/usuarios/perfil',
        visible: isAdministrator(),
        showInSidebar: true
      }
    ]
  },
  {
    id: 'catalog',
    label: 'mentors:navigation.catalog',
    icon: IconShoppingCart,
    visible: true,
    showInSidebar: true,
    children: [
      {
        id: 'products',
        label: 'mentors:navigation.catalog.products',
        icon: IconPackage,
        route: '/admin/catalogo/produto',
        visible: hasPermission('products.read'),
        showInSidebar: true
      },
      {
        id: 'products-form',
        label: 'mentors:navigation.catalog.products.form',
        icon: IconBox,
        route: '/admin/catalogo/produto/:produtoId',
        visible: hasPermission('products.write'),
        showInSidebar: false
      },
      {
        id: 'categories',
        label: 'mentors:navigation.catalog.categories',
        icon: IconCategory,
        route: '/admin/catalogo/categoria',
        visible: hasPermission('categories.read'),
        showInSidebar: true
      },
      {
        id: 'tags',
        label: 'mentors:navigation.catalog.tags',
        icon: IconTags,
        route: '/admin/catalogo/tag',
        visible: hasPermission('tags.read'),
        showInSidebar: true
      }
    ]
  },
  {
    id: 'reports',
    label: 'mentors:navigation.reports',
    icon: IconReports,
    visible: hasPermission('reports.read'),
    showInSidebar: true,
    children: [
      {
        id: 'sales-report',
        label: 'mentors:navigation.reports.sales',
        icon: IconChartBar,
        route: '/admin/relatorios/vendas',
        visible: hasPermission('reports.sales'),
        showInSidebar: true
      },
      {
        id: 'inventory-report',
        label: 'mentors:navigation.reports.inventory',
        icon: IconFileText,
        route: '/admin/relatorios/estoque',
        visible: hasPermission('reports.inventory'),
        showInSidebar: true
      }
    ]
  },
  {
    id: 'settings',
    label: 'mentors:navigation.settings',
    icon: IconSettings,
    visible: isAdministrator(),
    showInSidebar: true,
    children: [
      {
        id: 'system-config',
        label: 'mentors:navigation.settings.system',
        icon: IconCog,
        route: '/admin/configuracoes/sistema',
        visible: isAdministrator(),
        showInSidebar: true
      },
      {
        id: 'database-config',
        label: 'mentors:navigation.settings.database',
        icon: IconDatabase,
        route: '/admin/configuracoes/banco',
        visible: isAdministrator(),
        showInSidebar: true
      }
    ]
  }
];

export function AdminNavigationExample() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigationClick = (item: ArchbaseNavigationItem) => {
    if (item.route) {
      navigate(item.route);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex' }}>
      <ArchbaseNavigation
        navigationData={navigationData}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        showLabels={!collapsed}
        currentPath={location.pathname}
        onItemClick={handleNavigationClick}
        style={{
          width: collapsed ? 60 : 280,
          borderRight: '1px solid #e9ecef',
          transition: 'width 0.2s ease'
        }}
      />

      <div style={{ flex: 1, padding: 20 }}>
        <h1>Conteúdo Principal</h1>
        <p>Rota atual: {location.pathname}</p>
      </div>
    </div>
  );
}

// Navigation with custom rendering
export function CustomNavigationExample() {
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  const renderNavigationItem = (item: ArchbaseNavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.id === activeSection;
    const indent = level * 20;

    return (
      <div key={item.id}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            paddingLeft: 16 + indent,
            cursor: 'pointer',
            backgroundColor: isActive ? '#e7f5ff' : 'transparent',
            borderLeft: isActive ? '3px solid #228be6' : '3px solid transparent',
            ':hover': {
              backgroundColor: '#f8f9fa'
            }
          }}
          onClick={() => {
            setActiveSection(item.id);
            if (item.route) {
              console.log('Navigate to:', item.route);
            }
          }}
        >
          {item.icon && (
            <item.icon
              size={20}
              style={{ marginRight: 12, color: isActive ? '#228be6' : '#868e96' }}
            />
          )}
          <span style={{ 
            flex: 1, 
            color: isActive ? '#228be6' : '#212529',
            fontWeight: isActive ? 500 : 400
          }}>
            {item.label.replace('mentors:', '')}
          </span>
          {hasChildren && (
            <IconChevronDown size={16} style={{ color: '#868e96' }} />
          )}
        </div>

        {hasChildren && item.children?.map(child => 
          renderNavigationItem(child, level + 1)
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ 
        width: 300, 
        backgroundColor: '#fff',
        borderRight: '1px solid #e9ecef',
        overflow: 'auto'
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #e9ecef' }}>
          <h3 style={{ margin: 0, color: '#212529' }}>Admin Panel</h3>
        </div>
        {navigationData
          .filter(item => item.visible && item.showInSidebar)
          .map(item => renderNavigationItem(item))
        }
      </div>

      <div style={{ flex: 1, padding: 20 }}>
        <h1>Seção Ativa: {activeSection}</h1>
      </div>
    </div>
  );
}