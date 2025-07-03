import React, { useState } from 'react';
import { ArchbaseCard, ArchbaseText, ArchbaseImage } from '@archbase/react';

interface TestCard2Props {
  title: string;
  description: string;
}

const TestCard2: React.FC<TestCard2Props> = ({
  title,
  description,
}) => {
  
  
  return (
    <ArchbaseCard className="TestCard2">
      <ArchbaseText>title</ArchbaseText>
      <ArchbaseText>description</ArchbaseText>
    </ArchbaseCard>
  );
};

TestCard2.defaultProps = {};

export default TestCard2;