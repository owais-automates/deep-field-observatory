import { ExoplanetData, StarSystemData, Dataset } from '@/types';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DataQualityReport {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  validationRate: number;
  issues: string[];
}

class ScientificValidator {
  validateExoplanetData(data: ExoplanetData[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let validCount = 0;

    data.forEach((exoplanet, index) => {
      // Validate required fields
      if (!exoplanet.id) errors.push(`Exoplanet ${index}: Missing id`);
      if (!exoplanet.name) errors.push(`Exoplanet ${index}: Missing name`);
      
      // Validate scientific constraints
      if (exoplanet.distance <= 0) errors.push(`Exoplanet ${index}: Distance must be positive`);
      if (exoplanet.mass <= 0) errors.push(`Exoplanet ${index}: Mass must be positive`);
      if (exoplanet.radius <= 0) errors.push(`Exoplanet ${index}: Radius must be positive`);
      if (exoplanet.discoveryYear < 1990 || exoplanet.discoveryYear > new Date().getFullYear()) {
        warnings.push(`Exoplanet ${index}: Discovery year outside expected range`);
      }
      
      // Validate IAU naming conventions
      if (!/^[A-Z]/.test(exoplanet.name)) {
        warnings.push(`Exoplanet ${index}: Name should start with capital letter (IAU convention)`);
      }
      
      // Validate scientific plausibility
      if (exoplanet.mass > 100) {
        warnings.push(`Exoplanet ${index}: Mass unusually high (>100 Earth masses)`);
      }
      if (exoplanet.radius > 10) {
        warnings.push(`Exoplanet ${index}: Radius unusually large (>10 Earth radii)`);
      }
      
      if (!errors.some(e => e.includes(`Exoplanet ${index}`))) {
        validCount++;
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateStarSystemData(data: StarSystemData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.star) errors.push('Star system missing star data');
    if (!data.star.name) errors.push('Star system missing star name');
    if (data.star.radius <= 0) errors.push('Star radius must be positive');
    
    if (!data.planets || data.planets.length === 0) {
      warnings.push('Star system has no planets');
    }

    data.planets?.forEach((planet, index) => {
      if (planet.radius <= 0) errors.push(`Planet ${index}: Radius must be positive`);
      if (planet.distance <= 0) errors.push(`Planet ${index}: Distance must be positive`);
      if (planet.orbitalPeriod <= 0) errors.push(`Planet ${index}: Orbital period must be positive`);
      
      // Validate orbital mechanics
      if (planet.distance < planet.radius * 2) {
        warnings.push(`Planet ${index}: Very close to star, may be tidally locked`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateDatasetData(data: Dataset[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    data.forEach((dataset, index) => {
      if (!dataset.name) errors.push(`Dataset ${index}: Missing name`);
      if (!dataset.data || dataset.data.length === 0) {
        warnings.push(`Dataset ${index}: No data points`);
      }
      
      dataset.data?.forEach((point, pointIndex) => {
        if (typeof point.x !== 'number' || typeof point.y !== 'number') {
          errors.push(`Dataset ${index}, point ${pointIndex}: Invalid data format`);
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  generateDataQualityReport(
    exoplanets: ExoplanetData[],
    starSystem: StarSystemData,
    datasets: Dataset[]
  ): DataQualityReport {
    const exoplanetValidation = this.validateExoplanetData(exoplanets);
    const starValidation = this.validateStarSystemData(starSystem);
    const datasetValidation = this.validateDatasetData(datasets);

    const allErrors = [
      ...exoplanetValidation.errors,
      ...starValidation.errors,
      ...datasetValidation.errors
    ];

    const totalRecords = exoplanets.length + 1 + datasets.length;
    const invalidRecords = allErrors.length;
    const validRecords = totalRecords - invalidRecords;
    const validationRate = totalRecords > 0 ? (validRecords / totalRecords) * 100 : 0;

    return {
      totalRecords,
      validRecords,
      invalidRecords,
      validationRate,
      issues: allErrors
    };
  }
}

export const scientificValidator = new ScientificValidator();