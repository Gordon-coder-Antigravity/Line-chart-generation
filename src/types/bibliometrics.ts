export interface RawPublicationRecord {
  title?: string;
  year?: number | string;
  publisherCity?: string;
  publisher?: string;
  journal?: string;
  doi?: string;
  authors?: string;
  raw?: Record<string, any>;
}

export interface ProcessedRecord {
  id: string;
  title: string;
  year: number;
  originalCity: string;
  resolvedCountry: string;
  publisher: string;
  journal: string;
}

export interface CityMappingEntry {
  city: string;
  country: string;
  count: number;
  isCustom: boolean;
  status: 'verified' | 'inferred' | 'unmapped';
}

export interface YearCount {
  year: number;
  count: number;
}

export interface CountryAnalysis {
  country: string;
  total: number;
  yearlyCounts: Record<number, number>; // year -> count
  dataPoints: YearCount[]; // sorted by year
}

export interface PanelConfig {
  id: string;
  letter: string; // e.g., 'A', 'B', 'C', 'D'
  countryKey: string; // 'Global' or country name
  title: string; // e.g., 'Global', 'USA', 'China', 'Australia'
  yMin?: number;
  yMax?: number;
  yStep?: number;
  xMin?: number;
  xMax?: number;
  xStep?: number;
  lineStyle?: 'dashed' | 'solid' | 'dotted';
  markerShape?: 'circle' | 'square' | 'triangle';
  markerSize?: number;
  strokeWidth?: number;
  lineColor?: string;
}

export interface FigureStyleSettings {
  fontFamily: 'sans' | 'serif' | 'mono';
  xAxisTitle: string;
  yAxisTitle: string;
  axisLineWidth: number;
  tickLength: number;
  tickDirection: 'out' | 'in';
  showSubtleGrid: boolean;
  lineColor: string;
  pointColor: string;
  pointSize: number;
  lineWidth: number;
  defaultLineStyle: 'dashed' | 'solid' | 'dotted';
  layout: '2x2' | '1x2' | '1x3' | '2x3' | '3x3' | '1x1' | '1x4';
  cardWidth: number; // base render width per chart
  cardHeight: number; // base render height per chart
}
