import React from 'react';
import { Container, ScrollArea } from '@mantine/core';
import { ExecutiveDashboard } from '../dashboards/ExecutiveDashboard';

function DashboardPage() {
  return (
    <Container fluid p={0} h="100%">
      <ScrollArea h="calc(100vh - 100px)" type="scroll">
        <ExecutiveDashboard />
      </ScrollArea>
    </Container>
  );
}

export default DashboardPage;