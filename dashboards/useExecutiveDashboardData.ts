import { useState, useEffect, useCallback } from 'react';
import { useArchbaseRemoteServiceApi, API_TYPE } from 'archbase-react';
import { ExecutiveDashboardState, KPIData, ChartData } from './ExecutiveDashboardTypes';

export function useExecutiveDashboardData(autoRefresh = 60000) {
  const [state, setState] = useState<ExecutiveDashboardState>({
    loading: true,
    error: undefined,
    kpis: {
      totalrevenue: 0,
      totalorders: 0,
      activeusers: 0,
      activecities: 0
    },
    chartData: {
      revenuetrend: [],
      ordersbycity: [],
      growthmetrics: []
    },
  });

  // TODO: Replace with actual service
  // const dashboardService = useArchbaseRemoteServiceApi<ExecutiveDashboardService>(API_TYPE.Dashboard);

  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));

      // TODO: Replace with actual API calls
      // const kpis = await dashboardService.getKPIData();
      const kpis = {
        totalrevenue: Math.floor(Math.random() * 1000),
        totalorders: Math.floor(Math.random() * 1000),
        activeusers: Math.floor(Math.random() * 1000),
        activecities: Math.floor(Math.random() * 1000)
      };

      // Load chart data
      const chartData = {
        revenuetrend: generateMockRevenuetrendData(),
        ordersbycity: generateMockOrdersbycityData(),
        growthmetrics: generateMockGrowthmetricsData()
      };


      setState(prev => ({
        ...prev,
        loading: false,
        kpis,
        chartData,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar dados do dashboard'
      }));
    }
  }, []);

  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();

    // Setup auto-refresh
    const interval = setInterval(refreshData, autoRefresh);
    return () => clearInterval(interval);
  }, [loadData, refreshData]);

  return {
    ...state,
    refreshData,
    loadData
  };
}

// Mock data generators for charts
function generateMockRevenuetrendData() {
  // TODO: Replace with actual data structure for Revenue Trend
  return Array.from({ length: 10 }, (_, i) => ({
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * 100),
  }));
}
function generateMockOrdersbycityData() {
  // TODO: Replace with actual data structure for Orders by City
  return Array.from({ length: 10 }, (_, i) => ({
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * 100),
  }));
}
function generateMockGrowthmetricsData() {
  // TODO: Replace with actual data structure for Growth Metrics
  return Array.from({ length: 10 }, (_, i) => ({
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * 100),
  }));
}

