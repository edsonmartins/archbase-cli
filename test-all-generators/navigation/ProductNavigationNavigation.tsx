import React from 'react';
import { IconPackage } from '@tabler/icons-react';
import { ArchbaseNavigationItem } from 'archbase-react';
import ProdutoView from '../views/produto/ProdutoView';
import ProdutoForm from '../views/produto/ProdutoForm';

// Route constants (following powerview-admin pattern)
export const PRODUTO_ROUTE = '/admin/produtos/produto';
export const PRODUTO_FORM_ROUTE = '/admin/produtos/produto/:produtoId';

// Category constant
export const PRODUTOS_CATEGORY = 'produtos';

// View navigation item
export const produtoView: ArchbaseNavigationItem = {
  label: 'mentors:Produto',
  link: PRODUTO_ROUTE,
  category: PRODUTOS_CATEGORY,
  component: <ProdutoView />,
  icon: <IconPackage strokeWidth={1.25} size={28} />,
  color: 'blue',
  showInSidebar: true,
  disabled: false
};

// Form navigation item (hidden from sidebar)
export const produtoForm: ArchbaseNavigationItem = {
  label: 'mentors:Produto',
  link: PRODUTO_FORM_ROUTE,
  category: PRODUTOS_CATEGORY,
  component: <ProdutoForm />,
  showInSidebar: false, // Forms are not shown in sidebar
  redirect: PRODUTO_ROUTE // Redirect after operations
};


// Export navigation data array (add to main navigationData)
export const produtoNavigationData: ArchbaseNavigationItem[] = [
  produtoView,
  produtoForm
];

// Usage example:
// import { produtoNavigationData } from './ProductNavigationNavigation';
// 
// const navigationData: ArchbaseNavigationItem[] = [
//   ...produtoNavigationData,
//   // ... other navigation items
// ];