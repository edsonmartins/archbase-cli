// Types for ExecutiveDashboard Dashboard

export interface KPIData {
  totalrevenue: number;
  totalorders: number;
  activeusers: number;
  activecities: number;
}

export interface ChartDataPoint {
  [key: string]: any;
}

export interface ChartData {
  revenuetrend: ChartDataPoint[];
  ordersbycity: ChartDataPoint[];
  growthmetrics: ChartDataPoint[];
}



export interface ExecutiveDashboardState {
  loading: boolean;
  error?: string;
  kpis: KPIData;
  chartData: ChartData;
}

// Service interfaces
export interface ExecutiveDashboardService {
  getKPIData(): Promise<KPIData>;
  getRevenuetrendData(): Promise<ChartDataPoint[]>;
  getOrdersbycityData(): Promise<ChartDataPoint[]>;
  getGrowthmetricsData(): Promise<ChartDataPoint[]>;
}
