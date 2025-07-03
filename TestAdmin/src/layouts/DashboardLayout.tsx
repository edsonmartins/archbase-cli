import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ArchbaseSidebar, ArchbaseHeader } from '@archbase/react'
import { 
  DashboardIcon, 
  UsersIcon, 
  ReportsIcon, 
  SettingsIcon,
  MenuIcon,
  BellIcon,
  UserCircleIcon
} from '../components/icons'
import { useAuth } from '../hooks/useAuth'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const { user, logout } = useAuth()

  const sidebarItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      label: 'Usuários',
      path: '/users',
      icon: <UsersIcon />,
    },
    {
      label: 'Configurações',
      path: '/settings',
      icon: <SettingsIcon />,
    },
  ]

  const headerActions = [
    {
      icon: <UserCircleIcon />,
      dropdown: [
        { label: 'Perfil', onClick: () => {} },
        { label: 'Sair', onClick: logout },
      ],
    },
  ]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <ArchbaseSidebar
        items={sidebarItems}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        title="Admin Dashboard"
        logo="/logo.svg"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ArchbaseHeader
          title=""
          leftContent={
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MenuIcon />
            </button>
          }
          rightContent={
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Olá, {user?.name || 'Usuário'}
              </span>
              <div className="flex items-center gap-2">
                {headerActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                  >
                    {action.icon}
                    {action.badge && (
                      <span className="absolute top-0 right-0 -mt-1 -mr-1 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                        {action.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          }
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  )
}