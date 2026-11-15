# OpenSpec Component Specifications

## ExoplanetCard Component
```typescript
interface ExoplanetCardProps {
  exoplanet: ExoplanetData;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

// Spec: Scientific data display with precision formatting
// - Left-aligned data values
// - Scientific notation for large numbers
// - Confidence intervals displayed
// - Interactive selection state
// - Hover effects with glow
```

## StarSystem3D Component
```typescript
interface StarSystem3DProps {
  systemData: StarSystemData;
  viewMode: 'orbital' | 'habitable' | 'composition';
  autoRotate: boolean;
}

// Spec: 3D visualization with non-user-triggered motion
// - Subtle orbital animations
// - View mode transitions
// - Auto-rotation for idle states
// - Scientific accuracy in proportions
// - Responsive sizing
```

## DataVisualizationDashboard
```typescript
interface DataVisualizationDashboardProps {
  datasets: Dataset[];
  selectedMetrics: Metric[];
  timeRange: TimeRange;
}

// Spec: Multi-dimensional scientific data visualization
// - D3.js powered charts
// - Interactive metric selection
// - Time range controls
// - Export functionality for research
// - Responsive design
```

## ExoplanetList Component
```typescript
interface ExoplanetListProps {
  exoplanets: ExoplanetData[];
}

// Spec: Container for exoplanet cards
// - Grid layout
// - Client-side interactivity
// - Responsive columns
```

## Data Models
```typescript
interface ExoplanetData {
  id: string;
  name: string;
  distance: number; // in light years
  mass: number; // in Earth masses
  radius: number; // in Earth radii
  discoveryYear: number;
}

interface StarSystemData {
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

interface Dataset {
  name: string;
  data: Array<{ x: number; y: number }>;
}

interface Metric {
  id: string;
  name: string;
  unit: string;
}

interface TimeRange {
  start: Date;
  end: Date;
}
```