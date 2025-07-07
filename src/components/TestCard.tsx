import React, useState from 'react';
import { ArchbaseCard, ArchbaseText, ArchbaseImage } from 'archbase-react';

interface TestCardProps {
  title: string;
  description: string;
}

const TestCard: React.FC<TestCardProps> = ({
  title,
  description,
}) => {
  
  
  return (
    <ArchbaseCard className="TestCard">
      <ArchbaseText>title</ArchbaseText>
      <ArchbaseText>description</ArchbaseText>
    </ArchbaseCard>
  );
};

TestCard.defaultProps = {};

export default TestCard;