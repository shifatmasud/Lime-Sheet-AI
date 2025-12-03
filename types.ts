export interface Cell {
  value: string;
}

export type Row = Cell[];
export type SheetData = Row[];

export enum MessageType {
  USER = 'USER',
  AI = 'AI',
  SYSTEM = 'SYSTEM'
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'area' | 'pie' | 'radar';
  dataKey: string; // The key/header to use for X-axis or labels
  series: string[]; // Array of keys/headers to plot
  title?: string;
}

export interface DashboardItem {
  id: string;
  config: ChartConfig;
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  chartConfig?: ChartConfig;
  timestamp: number;
}

export interface ColumnMeta {
  width: number;
  color?: string;
}

export interface AppState {
  data: SheetData;
  headers: string[];
  columnMeta: Record<number, ColumnMeta>;
  filename: string;
  isProcessing: boolean;
  messages: Message[];
  dashboard: DashboardItem[];
  apiKey: string | null;
}

// Styling Types
export type Variant = 'primary' | 'secondary' | 'ghost' | 'icon';
export type Size = 'sm' | 'md' | 'lg';