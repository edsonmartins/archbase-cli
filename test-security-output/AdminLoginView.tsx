import React from 'react';
import { Card, Title, Text } from '@mantine/core';

export interface AdminLoginProps {
  brandName?: string;
}

export function AdminLogin({ brandName = "TestApp" }: AdminLoginProps) {
  return (
    <Card>
      <Title>AdminLogin - {brandName}</Title>
      <Text>Login component for TestApp</Text>
      <Text>Mobile support enabled</Text>
      <Text>Branding enabled</Text>
    </Card>
  );
}