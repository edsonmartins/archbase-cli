import React from 'react';
import { IconServer } from '@tabler/icons-react';
import { ArchbaseNavigationItem } from '@archbase/react';
import PlataformaView from '../views/plataforma/PlataformaView';

// Route constants (following powerview-admin pattern)
export const PLATAFORMA_ROUTE = '/admin/configuracao/plataforma';

// Category constant
export const CONFIGURACAO_CATEGORY = 'configuracao';

// View navigation item
export const plataformaView: ArchbaseNavigationItem = {
  label: 'mentors:Plataforma',
  link: PLATAFORMA_ROUTE,
  category: CONFIGURACAO_CATEGORY,
  component: <PlataformaView />,
  icon: <IconServer strokeWidth={1.25} size={28} />,
  color: 'green',
  showInSidebar: true,
  disabled: false
};



// Export navigation data array (add to main navigationData)
export const plataformaNavigationData: ArchbaseNavigationItem[] = [
  plataformaView
];

// Usage example:
// import { plataformaNavigationData } from './PlataformaNavigationNavigation';
// 
// const navigationData: ArchbaseNavigationItem[] = [
//   ...plataformaNavigationData,
//   // ... other navigation items
// ];