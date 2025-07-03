import React from 'react';
import { ArchbaseSidebar, ArchbaseLayout } from '@archbase/react';

interface DashboardProps {
  title?: string;
  children?: React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({
  title = 'Admin Dashboard',
  children
}) => {
  const sidebarItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Usuários', path: '/users', icon: 'users' },
    { label: 'Configurações', path: '/settings', icon: 'settings' },
  ];

  return (
      <ArchbaseLayout>
        <ArchbaseSidebar
          items={sidebarItems}
          title="Admin Dashboard"
          collapsible
        />
        
        <div className="Dashboard__content">
          
          <div className="Dashboard__header">
            <h1>{title}</h1>
          </div>
          
          <div className="Dashboard__main">
            {children}
          </div>
          
        </div>
      </ArchbaseLayout>
  );
};

export default Dashboard;