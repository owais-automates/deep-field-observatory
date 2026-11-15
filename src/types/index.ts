export interface ExoplanetData {
  id: string;
  name: string;
  distance: number; // in light years
  mass: number; // in Earth masses
  radius: number; // in Earth radii
  discoveryYear: number;
}

export interface StarSystemData {
  star: {
    name: string;
    radius: number;
    color: string;
  };
  planets: Array<{
    name: string;
    radius: number;
    distance: number;
    color: string;
    orbitalPeriod: number;
  }>;
}

export interface Dataset {
  name: string;
  data: Array<{
    x: number;
    y: number;
  }>;
}

export interface Metric {
  id: string;
  name: string;
  unit: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface ExoplanetCardProps {
  exoplanet: ExoplanetData;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export interface StarSystem3DProps {
  systemData: StarSystemData;
  viewMode: 'orbital' | 'habitable' | 'composition';
  autoRotate: boolean;
}

export interface DataVisualizationDashboardProps {
  datasets: Dataset[];
  selectedMetrics: Metric[];
  timeRange: TimeRange;
}
