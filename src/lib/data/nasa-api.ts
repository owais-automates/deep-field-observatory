import { ExoplanetData, StarSystemData, Dataset } from '@/types';

// NASA Exoplanet Archive API
const EXOPLANET_ARCHIVE_API = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';

// TESS Mission API
const TESS_API = 'https://tess.mit.edu/api/';

// Kepler Mission API
const KEPLER_API = 'https://kepler.nasa.gov/api/';

// Mock data for development
const mockExoplanets: ExoplanetData[] = [
  {
    id: '1',
    name: 'Kepler-186f',
    distance: 490,
    mass: 1.1,
    radius: 1.1,
    discoveryYear: 2014
  },
  {
    id: '2',
    name: 'TRAPPIST-1e',
    distance: 39,
    mass: 0.7,
    radius: 0.9,
    discoveryYear: 2017
  },
  {
    id: '3',
    name: 'Proxima Centauri b',
    distance: 4.2,
    mass: 1.2,
    radius: 1.1,
    discoveryYear: 2016
  }
];

const mockStarSystem: StarSystemData = {
  star: {
    name: 'Sol',
    radius: 1.0,
    color: '#FFD700'
  },
  planets: [
    {
      id: 'mercury',
      name: 'Mercury',
      radius: 0.38,
      distance: 0.39,
      mass: 0.055,
      color: '#BEBEBE',
      orbitalPeriod: 0.24
    },
    {
      id: 'venus',
      name: 'Venus',
      radius: 0.95,
      distance: 0.72,
      mass: 0.815,
      color: '#FFA500',
      orbitalPeriod: 0.62
    },
    {
      id: 'earth',
      name: 'Earth',
      radius: 1.0,
      distance: 1.0,
      mass: 1.0,
      color: '#1E90FF',
      orbitalPeriod: 1.0
    },
    {
      id: 'mars',
      name: 'Mars',
      radius: 0.53,
      distance: 1.52,
      mass: 0.107,
      color: '#FF4500',
      orbitalPeriod: 1.88
    }
  ]
};

const mockDatasets: Dataset[] = [
  {
    name: 'Exoplanet Discoveries',
    data: [
      { x: 2000, y: 10 },
      { x: 2005, y: 50 },
      { x: 2010, y: 100 },
      { x: 2015, y: 200 },
      { x: 2020, y: 400 }
    ]
  }
];

// Fetch exoplanet data (mock implementation for development)
async function fetchExoplanetData(): Promise<ExoplanetData[]> {
  // In production, replace with actual API call
  return Promise.resolve(mockExoplanets);
}

// Fetch star system data (mock implementation for development)
async function fetchStarSystemData(): Promise<StarSystemData> {
  // In production, replace with actual API call
  return Promise.resolve(mockStarSystem);
}

// Fetch dataset for visualization (mock implementation for development)
async function fetchVisualizationData(): Promise<Dataset[]> {
  // In production, replace with actual API call
  return Promise.resolve(mockDatasets);
}

export {
  fetchExoplanetData,
  fetchStarSystemData,
  fetchVisualizationData
};
