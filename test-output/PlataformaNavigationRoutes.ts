/**
 * Plataforma Routes Constants
 * 
 * Following powerview-admin pattern for route definitions.
 * These constants are used throughout the application for navigation.
 */

// Main routes
export const PLATAFORMA_ROUTE = '/admin/configuracao/plataforma';

// Category constant
export const CONFIGURACAO_CATEGORY = 'configuracao';

// Action constants
export const ADD_ACTION = 'ADD';
export const EDIT_ACTION = 'EDIT';
export const VIEW_ACTION = 'VIEW';

// Navigation helper functions
export const plataformaRoutes = {
  // Get the main list route
  getListRoute: () => PLATAFORMA_ROUTE,
  
  
  // Check if current route matches this feature
  isCurrentRoute: (pathname: string) => 
    pathname.startsWith(PLATAFORMA_ROUTE),
    
  // Get category
  getCategory: () => CONFIGURACAO_CATEGORY
};

// Export individual constants for convenience
export {
  PLATAFORMA_ROUTE as PLATAFORMA_ROUTE,
  CONFIGURACAO_CATEGORY as CONFIGURACAO_CATEGORY
};