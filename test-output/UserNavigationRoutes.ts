/**
 * Usuario Routes Constants
 * 
 * Following powerview-admin pattern for route definitions.
 * These constants are used throughout the application for navigation.
 */

// Main routes
export const USUARIO_ROUTE = '/admin/usuarios/usuario';
export const USUARIO_FORM_ROUTE = '/admin/usuarios/usuario/:usuarioId';

// Category constant
export const USUARIOS_CATEGORY = 'usuarios';

// Action constants
export const ADD_ACTION = 'ADD';
export const EDIT_ACTION = 'EDIT';
export const VIEW_ACTION = 'VIEW';

// Navigation helper functions
export const usuarioRoutes = {
  // Get the main list route
  getListRoute: () => USUARIO_ROUTE,
  
  // Get form route for specific action
  getFormRoute: (usuarioId?: string, action: string = ADD_ACTION) => {
    if (action === ADD_ACTION) {
      return USUARIO_ROUTE + '/novo-' + Date.now();
    }
    return USUARIO_ROUTE + '/' + usuarioId;
  },
  
  // Get edit route
  getEditRoute: (usuarioId: string) => 
    usuarioRoutes.getFormRoute(usuarioId, EDIT_ACTION),
  
  // Get view route  
  getViewRoute: (usuarioId: string) => 
    usuarioRoutes.getFormRoute(usuarioId, VIEW_ACTION),
  
  // Check if current route matches this feature
  isCurrentRoute: (pathname: string) => 
    pathname.startsWith(USUARIO_ROUTE),
    
  // Get category
  getCategory: () => USUARIOS_CATEGORY
};

// Export individual constants for convenience
export {
  USUARIO_ROUTE as USUARIO_ROUTE,
  USUARIO_FORM_ROUTE as USUARIO_FORM_ROUTE,
  USUARIOS_CATEGORY as USUARIOS_CATEGORY
};