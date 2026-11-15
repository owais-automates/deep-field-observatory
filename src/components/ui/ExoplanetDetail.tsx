'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ExoplanetData } from '@/types';

interface ExoplanetDetailProps {
  exoplanetId: string;
  exoplanets: ExoplanetData[];
}

function fmt(value: unknown, unit = '', fallback = 'Unavailable'): string {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number' && !Number.isFinite(value)) return fallback;
  return `${value}${unit}`;
}

export const ExoplanetDetail = ({ exoplanetId, exoplanets }: ExoplanetDetailProps) => {
  const { selectExoplanet, setDiscoveryView } = useApp();

  const target = exoplanets.find((p) => p.id === exoplanetId);

  if (!target) {
    return (
      <div className="text-text-tertiary text-sm p-2 font-mono">
        Selected exoplanet record is unavailable in the current catalog.
      </div>
    );
  }

  const backToCatalog = () => {
    selectExoplanet(null);
    setDiscoveryView('list');
  };

  const field = (label: string, value: React.ReactNode) => (
    <div className="flex flex-col gap-0.5 py-1.5">
      <span className="text-text-tertiary text-[10px] font-mono uppercase tracking-wider">{label}</span>
      <span className="text-text-primary text-sm font-mono tabular-nums">{value}</span>
    </div>
  );

  return (
    <div className="p-4">
      <h3 className="text-text-primary text-base font-semibold font-heading mb-3">
        Exoplanet Detail
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
        {field('Name', fmt(target.name))}
        {field('Distance', fmt(target.distance, ' ly'))}
        {field('Mass', target.mass != null ? `${target.mass} M⊕` : 'Unavailable')}
        {field('Radius', target.radius != null ? `${target.radius} R⊕` : 'Unavailable')}
        {field('Discovery year', fmt(target.discoveryYear))}
        {field('Host system', 'Unavailable (unverified in catalog)')}
      </div>
      <p className="mt-3 text-text-tertiary text-xs font-mono">
        Demo catalog data; missing fields shown as Unavailable.
      </p>
      <div className="mt-4">
        <button
          type="button"
          onClick={backToCatalog}
          className="px-4 py-2 text-xs font-mono text-primary border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Back to Catalog
        </button>
      </div>
    </div>
  );
};