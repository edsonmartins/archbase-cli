import React from 'react';
import { IconUser } from '@tabler/icons-react';
import { ArchbaseNavigationItem } from '@archbase/react';
import UsuarioView from '../views/usuario/UsuarioView';
import UsuarioForm from '../views/usuario/UsuarioForm';

// Route constants (following powerview-admin pattern)
export const USUARIO_ROUTE = '/admin/usuarios/usuario';
export const USUARIO_FORM_ROUTE = '/admin/usuarios/usuario/:usuarioId';

// Category constant
export const USUARIOS_CATEGORY = 'usuarios';

// View navigation item
export const usuarioView: ArchbaseNavigationItem = {
  label: 'mentors:Usuario',
  link: USUARIO_ROUTE,
  category: USUARIOS_CATEGORY,
  component: <UsuarioView />,
  icon: <IconUser strokeWidth={1.25} size={28} />,
  color: 'blue',
  showInSidebar: true,
  disabled: false
};

// Form navigation item (hidden from sidebar)
export const usuarioForm: ArchbaseNavigationItem = {
  label: 'mentors:Usuario',
  link: USUARIO_FORM_ROUTE,
  category: USUARIOS_CATEGORY,
  component: <UsuarioForm />,
  showInSidebar: false, // Forms are not shown in sidebar
  redirect: USUARIO_ROUTE // Redirect after operations
};


// Export navigation data array (add to main navigationData)
export const usuarioNavigationData: ArchbaseNavigationItem[] = [
  usuarioView,
  usuarioForm
];

// Usage example:
// import { usuarioNavigationData } from './UserNavigationNavigation';
// 
// const navigationData: ArchbaseNavigationItem[] = [
//   ...usuarioNavigationData,
//   // ... other navigation items
// ];