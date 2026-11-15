import { fetchExoplanetData, fetchStarSystemData, fetchVisualizationData } from '@/lib/data/nasa-api';
import { scientificValidator } from '@/lib/validation/scientific-validator';
import { ObservatoryShell } from '@/components/ui/ObservatoryShell';

export default async function HomePage() {
  // Fetch data
  const exoplanets = await fetchExoplanetData();
  const starSystem = await fetchStarSystemData();
  const datasets = await fetchVisualizationData();

  // Validate data scientifically
  const qualityReport = scientificValidator.generateDataQualityReport(
    exoplanets,
    starSystem,
    datasets
  );

  return (
    <ObservatoryShell
      exoplanets={exoplanets}
      starSystem={starSystem}
      datasets={datasets}
      qualityReport={qualityReport}
    />
  );
}