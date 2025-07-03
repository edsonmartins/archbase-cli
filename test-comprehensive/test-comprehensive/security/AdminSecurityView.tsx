import React from 'react';
import { Card, Title, Text } from '@mantine/core';

export interface AdminSecurityProps {
  brandName?: string;
}

export function AdminSecurity({ brandName = "Sistema" }: AdminSecurityProps) {
  return (
    <Card>
      <Title>AdminSecurity - {brandName}</Title>
      <Text>Login component for Sistema</Text>
      <Text>Branding enabled</Text>
    </Card>
  );
}