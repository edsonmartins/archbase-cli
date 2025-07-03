import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import { DashboardLayout } from './layouts/DashboardLayout'
import { LoadingSpinner } from './components/common/LoadingSpinner'

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const UsersPage = lazy(() => import('./pages/users/UsersPage'))
const UserDetailsPage = lazy(() => import('./pages/users/UserDetailsPage'))
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function Router() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* User management routes */}
          <Route path="users">
            <Route index element={<UsersPage />} />
            <Route path=":id" element={<UserDetailsPage />} />
          </Route>
          
          
          {/* Settings routes */}
          <Route path="settings" element={<SettingsPage />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default Router