import { ExoplanetData, StarSystemData, Dataset } from '@/types';

// NASA Exoplanet Archive API
const EXOPLANET_ARCHIVE_API = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';

// TESS Mission API
const TESS_API = 'https://tess.mit.edu/api/';

// Kepler Mission API
const KEPLER_API = 'https://kepler.nasa.gov/api/';

// Mock data for development. These records are explicitly labelled as demo and
// are used ONLY as a fallback when live NASA retrieval is unavailable. They must
// never be presented as NASA measurements.
const mockExoplanets: ExoplanetData[] = [
  {
    id: '1',
    name: 'Kepler-186f',
    distance: 490,
    mass: 1.1,
    radius: 1.1,
    discoveryYear: 2014,
    source: 'demo'
  },
  {
    id: '2',
    name: 'TRAPPIST-1e',
    distance: 39,
    mass: 0.7,
    radius: 0.9,
    discoveryYear: 2017,
    source: 'demo'
  },
  {
    id: '3',
    name: 'Proxima Centauri b',
    distance: 4.2,
    mass: 1.2,
    radius: 1.1,
    discoveryYear: 2016,
    source: 'demo'
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

// Targets requested from the NASA Exoplanet Archive. Display names are matched
// against the archive's pl_name field (case-insensitive) so the application's
// human-readable labels stay independent of the archive's identifiers.
const NASA_TARGETS: { id: string; name: string; archiveName: string }[] = [
  { id: '1', name: 'Kepler-186f', archiveName: 'Kepler-186 f' },
  { id: '2', name: 'TRAPPIST-1e', archiveName: 'TRAPPIST-1 e' },
  { id: '3', name: 'Proxima Centauri b', archiveName: 'Proxima Cen b' }
];

const NASA_QUERY =
  'SELECT pl_name,hostname,disc_year,discoverymethod,pl_rade,pl_bmasse,' +
  'pl_orbper,pl_orbsmax,sy_dist,pl_eqt FROM pscomppars WHERE hostname IN ' +
  "('Kepler-186','TRAPPIST-1','Proxima Cen') ORDER BY hostname,pl_name";

const NASA_TIMEOUT_MS = 10000;

// Parse a CSV string (no quoted-field escaping needed for this dataset) into
// an array of row objects keyed by the header row.
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cells[i] ?? ''; });
    return row;
  });
}

function toNumber(value: string): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

// Convert parsecs to light-years (1 pc = 3.261563777 ly).
function pcToLy(pc: number): number {
  return pc * 3.261563777;
}

// Map one NASA archive row to the application's ExoplanetData shape. Only
// fields present in the response are populated; everything else stays absent
// so the UI can show "Unavailable" rather than a fabricated value.
function mapArchiveRow(row: Record<string, string>): ExoplanetData {
  const name = (row.pl_name || '').trim();
  const match = NASA_TARGETS.find(
    (t) => t.archiveName.toLowerCase() === name.toLowerCase()
  );
  const distancePc = toNumber(row.sy_dist);

  return {
    id: match ? match.id : name.toLowerCase().replace(/\s/g, '-'),
    name: match ? match.name : name,
    distance: distancePc !== undefined ? pcToLy(distancePc) : 0,
    mass: toNumber(row.pl_bmasse) ?? 0,
    radius: toNumber(row.pl_rade) ?? 0,
    discoveryYear: toNumber(row.disc_year) ?? 0,
    hostStar: row.hostname || undefined,
    discoveryMethod: row.discoverymethod || undefined,
    orbitalPeriodDays: toNumber(row.pl_orbper),
    semiMajorAxisAu: toNumber(row.pl_orbsmax),
    equilibriumTempK: toNumber(row.pl_eqt),
    source: 'nasa-exoplanet-archive'
  };
}

// Fetch exoplanet data from the NASA Exoplanet Archive TAP service
// (Planetary Systems Composite Parameters). Falls back to the demo catalog
// only when retrieval fails, and every record carries a `source` tag so NASA
// and demo data can never be confused in the UI.
async function fetchExoplanetData(): Promise<ExoplanetData[]> {
  const url = `${EXOPLANET_ARCHIVE_API}?query=${encodeURIComponent(NASA_QUERY)}&format=csv`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NASA_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`NASA archive returned HTTP ${response.status}`);
    }
    const csv = await response.text();
    const rows = parseCsv(csv);
    if (rows.length === 0) {
      throw new Error('NASA archive returned no rows');
    }
    const targetIds = new Set(NASA_TARGETS.map((t) => t.id));
    const records = rows
      .map(mapArchiveRow)
      .filter((r) => targetIds.has(r.id) && r.source === 'nasa-exoplanet-archive');
    if (records.length === 0) {
      throw new Error('NASA archive returned no mappable targets');
    }
    return records;
  } catch (err) {
    // Fallback: demo data only, explicitly labelled. Never presented as NASA.
    console.warn(
      'NASA Exoplanet Archive unavailable, using demo catalog:',
      err instanceof Error ? err.message : String(err)
    );
    return mockExoplanets;
  } finally {
    clearTimeout(timer);
  }
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
