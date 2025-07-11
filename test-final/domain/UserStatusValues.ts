/**
 * User Status Values - UI Rendering Configuration
 * 
 * Following powerview-admin patterns for enum rendering in UI components.
 * Generated by DomainGenerator.
 */

import { ArchbaseItemRenderType } from 'archbase-react';
import { UserStatus } from './UserStatus';

// Values for UserStatus enum
export const UserStatusValues: ArchbaseItemRenderType[] = [
  {
    value: UserStatus.ACTIVE,
    label: 'mentors:Active',
    color: 'blue'
  },
  {
    value: UserStatus.INACTIVE,
    label: 'mentors:Inactive',
    color: 'blue'
  },
  {
    value: UserStatus.PENDING,
    label: 'mentors:Pending',
    color: 'blue'
  }
];


// Render function for UserStatus
export const renderUserStatus = (value: UserStatus): React.ReactNode => {
  const statusItem = UserStatusValues.find(item => item.value === value);
  
  if (statusItem) {
    return (
      <Badge color={statusItem.color} variant="light">
        <Text size={'0.8rem'}>{t(statusItem.label)}</Text>
      </Badge>
    );
  }
  
  return value;
};

