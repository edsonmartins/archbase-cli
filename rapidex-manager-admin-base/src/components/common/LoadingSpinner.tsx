import React from 'react';
import { Loader, Center } from '@mantine/core';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

export function LoadingSpinner({ fullScreen }: LoadingSpinnerProps = {}) {
  return (
    <Center style={{ height: fullScreen ? '100vh' : 'auto' }}>
      <Loader size="lg" />
    </Center>
  );
}