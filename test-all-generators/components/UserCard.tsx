import React from 'react';
import { ArchbaseCard, ArchbaseText, ArchbaseImage } from '@archbase/react';

interface UserCardProps {
  name: string;
  age: number;
  active: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  name,
  age,
  active,
}) => {
  
  
  return (
    <ArchbaseCard className="UserCard">
      <ArchbaseText>name</ArchbaseText>
    </ArchbaseCard>
  );
};

UserCard.defaultProps = {};

export default UserCard;