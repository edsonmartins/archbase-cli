import React, { useState, useEffect } from 'react';
import { Card, Grid, Text, Group, Stack, Badge, RingProgress, ScrollArea, Loader } from '@mantine/core';
import { IconDashboard } from '@tabler/icons-react';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useArchbaseNavigationListener } from 'archbase-react';
import { useArchbaseRemoteServiceApi, API_TYPE } from 'archbase-react';

interface VendasDashboardState {
  loading: boolean;
  error?: string;
  kpis: Record<string, number>;
  chartData: Record<string, any[]>;
}

export function VendasDashboard() {
  const [data, setData] = useState<VendasDashboardState>({
    loading: true,
    error: undefined,
    kpis: {},
    chartData: {},
  });

  const { closeAllowed } = useArchbaseNavigationListener('/admin/dashboard/vendas', () => {
    closeAllowed();
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: undefined }));
        
        // TODO: Replace with actual API calls
        const mockData = {
          kpis: {
            totalvendas: 0,
            clientes: 1,
            produtos: 2
          },
          chartData: {
            vendasmensais: Array.from({ length: 10 }, (_, i) => ({ name: `Item ${i + 1}`, value: Math.floor(Math.random() * 100) })),
            topprodutos: Array.from({ length: 10 }, (_, i) => ({ name: `Item ${i + 1}`, value: Math.floor(Math.random() * 100) }))
          },
        };

        setData(prev => ({
          ...prev,
          loading: false,
          ...mockData
        }));
      } catch (error) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro ao carregar dados'
        }));
      }
    };

    loadData();
    
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (data.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Text color="red">{data.error}</Text>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Group justify="space-between" className="mb-4">
          <div>
            <Text size="xl" className="font-bold">Dashboard de Vendas</Text>
            <Text size="sm" className="text-gray-600">Dashboard Dashboard de Vendas</Text>
          </div>
          <Badge color="blue" leftSection={<IconDashboard size={16} />}>
            Dashboard
          </Badge>
        </Group>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        <!-- KPI Section -->
        <div className="col-span-12 md:col-span-6">
          <Card withBorder className="h-32">
            <Group>
              <RingProgress
                size={80}
                sections={[{ value: Math.min(100, data.kpis.totalvendas || 0), color: 'green' }]}
                label={
                  <Group justify="center">
                    <IconDashboard size={24} />
                  </Group>
                }
              />
              <div>
                <Text size="sm" className="text-gray-600">Total Vendas</Text>
                <Text size="xl" className="font-bold">
                  {(data.kpis.totalvendas || 0).toLocaleString()}
                                  </Text>
              </div>
            </Group>
          </Card>
        </div>
        <div className="col-span-12 md:col-span-6">
          <Card withBorder className="h-32">
            <Group>
              <RingProgress
                size={80}
                sections={[{ value: Math.min(100, data.kpis.clientes || 0), color: 'blue' }]}
                label={
                  <Group justify="center">
                    <IconDashboard size={24} />
                  </Group>
                }
              />
              <div>
                <Text size="sm" className="text-gray-600">Clientes</Text>
                <Text size="xl" className="font-bold">
                  {(data.kpis.clientes || 0).toLocaleString()}
                                  </Text>
              </div>
            </Group>
          </Card>
        </div>
        <div className="col-span-12 md:col-span-4">
          <Card withBorder className="h-32">
            <Group>
              <RingProgress
                size={80}
                sections={[{ value: Math.min(100, data.kpis.produtos || 0), color: 'purple' }]}
                label={
                  <Group justify="center">
                    <IconDashboard size={24} />
                  </Group>
                }
              />
              <div>
                <Text size="sm" className="text-gray-600">Produtos</Text>
                <Text size="xl" className="font-bold">
                  {(data.kpis.produtos || 0).toLocaleString()}
                                  </Text>
              </div>
            </Group>
          </Card>
        </div>

        <!-- Charts Section -->
        <div className="col-span-12 lg:col-span-8">
          <Card withBorder className="h-300">
            <Group justify="space-between" className="mb-4">
              <Text size="lg" className="font-bold">Vendas Mensais</Text>
            </Group>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.chartData.vendasmensais || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <Card withBorder className="h-300">
            <Group justify="space-between" className="mb-4">
              <Text size="lg" className="font-bold">Top Produtos</Text>
            </Group>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.chartData.topprodutos || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="value"
                  fill="#8884d8"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default VendasDashboard;