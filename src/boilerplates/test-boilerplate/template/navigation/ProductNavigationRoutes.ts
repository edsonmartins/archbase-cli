/**
 * Produto Routes Constants
 * 
 * Following powerview-admin pattern for route definitions.
 * These constants are used throughout the application for navigation.
 */

// Main routes
export const PRODUTO_ROUTE = '/admin/produtos/produto';
export const PRODUTO_FORM_ROUTE = '/admin/produtos/produto/:produtoId';

// Category constant
export const PRODUTOS_CATEGORY = 'produtos';

// Action constants
export const ADD_ACTION = 'ADD';
export const EDIT_ACTION = 'EDIT';
export const VIEW_ACTION = 'VIEW';

// Navigation helper functions
export const produtoRoutes = {
  // Get the main list route
  getListRoute: () => PRODUTO_ROUTE,
  
  // Get form route for specific action
  getFormRoute: (produtoId?: string, action: string = ADD_ACTION) => {
    if (action === ADD_ACTION) {
      return PRODUTO_ROUTE + '/novo-' + Date.now();
    }
    return PRODUTO_ROUTE + '/' + produtoId;
  },
  
  // Get edit route
  getEditRoute: (produtoId: string) => 
    produtoRoutes.getFormRoute(produtoId, EDIT_ACTION),
  
  // Get view route  
  getViewRoute: (produtoId: string) => 
    produtoRoutes.getFormRoute(produtoId, VIEW_ACTION),
  
  // Check if current route matches this feature
  isCurrentRoute: (pathname: string) => 
    pathname.startsWith(PRODUTO_ROUTE),
    
  // Get category
  getCategory: () => PRODUTOS_CATEGORY
};

// Export individual constants for convenience
export {
  PRODUTO_ROUTE as PRODUTO_ROUTE,
  PRODUTO_FORM_ROUTE as PRODUTO_FORM_ROUTE,
  PRODUTOS_CATEGORY as PRODUTOS_CATEGORY
};