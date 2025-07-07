// Types for VendasDashboard Dashboard

export interface KPIData {
  totalvendas: number;
  clientes: number;
  produtos: number;
}

export interface ChartDataPoint {
  [key: string]: any;
}

export interface ChartData {
  vendasmensais: ChartDataPoint[];
  topprodutos: ChartDataPoint[];
}



export interface VendasDashboardState {
  loading: boolean;
  error?: string;
  kpis: KPIData;
  chartData: ChartData;
}

// Service interfaces
export interface VendasDashboardService {
  getKPIData(): Promise<KPIData>;
  getVendasmensaisData(): Promise<ChartDataPoint[]>;
  getTopprodutosData(): Promise<ChartDataPoint[]>;
}
