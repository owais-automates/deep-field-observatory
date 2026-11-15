'use client';

import React from 'react';
import { StarSystemData, ExoplanetData } from '@/types';
import { useApp } from '@/context/AppContext';
import { HZ_CONSERVATIVE, HZ_OPTIMISTIC } from '@/components/scientific/StarSystem3D';

function fmt(value: unknown, unit = '', fallback = '—'): string {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number' && !Number.isFinite(value)) return fallback;
  return `${value}${unit}`;
}

function exoField(exo: ExoplanetData, key: string): unknown {
  return (exo as unknown as Record<string, unknown>)[key];
}

export function SelectedObjectInfoRibbon({
  starSystem,
  exoplanets,
}: {
  starSystem: StarSystemData;
  exoplanets: ExoplanetData[];
}) {
  const { selectedSolarSystemPlanet, selectedExoplanet, requestCameraFocus, visualizationMode } = useApp();

  // Selection-state consistency (R1): respect explicit "no scene object" (null)
  const hasSceneSelection = selectedSolarSystemPlanet !== null && selectedSolarSystemPlanet !== undefined;
  const planet = hasSceneSelection && selectedSolarSystemPlanet !== 'sol'
    ? starSystem.planets.find((p) => p.id === selectedSolarSystemPlanet)
    : null;
  const exo = selectedExoplanet ? exoplanets.find((e) => e.id === selectedExoplanet) : null;

  const modeLabel = visualizationMode === 'habitable' ? 'Habitable Zone' : 'Orbital';

  // Source label reflects the record's provenance tag. NASA records are
  // labelled with their archive; demo fallback records stay labelled "Demo".
  const exoSourceLabel = exo?.source === 'nasa-exoplanet-archive'
    ? 'NASA Exoplanet Archive'
    : 'Demo';

  // Exoplanet selection
  if (exo) {
    return (
      <div className="border-t border-white/[0.08] bg-[rgba(5,6,10,0.98)] backdrop-blur-md px-3 sm:px-5 py-1.5 sm:py-2" role="region" aria-label="Selected exoplanet">
        <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap min-w-0 overflow-hidden">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-text-primary font-semibold font-heading text-sm sm:text-base leading-tight truncate flex-1 min-w-0">{exo.name}</span>
                <span className="text-text-tertiary text-[10px] sm:text-xs font-mono whitespace-nowrap flex-shrink-0">Exoplanet</span>
              </div>
              <span className="text-text-tertiary text-[9px] sm:text-[10px] font-mono">Catalog · {exoSourceLabel}</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 border-l border-white/[0.08] pl-4 flex-shrink-0">
              <div className="flex flex-col items-start">
                <span className="text-text-tertiary text-[9px] font-mono uppercase tracking-wider leading-none">Distance</span>
                <span className="text-text-primary text-xs font-mono">{fmt(exo.distance, ' ly')}</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-text-tertiary text-[9px] font-mono uppercase tracking-wider leading-none">Mass</span>
                <span className="text-text-primary text-xs font-mono">{exo.mass != null ? `${exo.mass} M⊕` : '—'}</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-text-tertiary text-[9px] font-mono uppercase tracking-wider leading-none">Radius</span>
                <span className="text-text-primary text-xs font-mono">{exo.radius != null ? `${exo.radius} R⊕` : '—'}</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-text-tertiary text-[9px] font-mono uppercase tracking-wider leading-none">Year</span>
                <span className="text-text-primary text-xs font-mono">{fmt(exo.discoveryYear)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] sm:text-xs font-mono flex-shrink-0">
            <span className="text-text-tertiary">Mode: <span className="text-text-secondary">{modeLabel}</span></span>
          </div>
        </div>
      </div>
    );
  }

  // No scene selection
  if (!hasSceneSelection) {
    return (
      <div className="border-t border-white/[0.08] bg-[rgba(5,6,10,0.98)] backdrop-blur-md px-3 sm:px-5 py-1.5 sm:py-2" role="region" aria-label="Scene information">
        <div className="flex items-center justify-between gap-3 flex-wrap min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-text-primary font-semibold font-heading text-sm truncate">No object selected</span>
            <span className="text-text-tertiary text-[10px] sm:text-xs truncate">Use the selector or click an object</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono flex-shrink-0">
            <span className="text-text-tertiary">System: <span className="text-text-secondary">{starSystem.star.name}</span></span>
            <span className="text-text-tertiary">Mode: <span className="text-text-secondary">{modeLabel}</span></span>
          </div>
        </div>
      </div>
    );
  }

  // Planet selection
  if (planet) {
    return (
      <div className="border-t border-white/[0.08] bg-[rgba(5,6,10,0.98)] backdrop-blur-md px-3 sm:px-5 py-1.5 sm:py-2" role="region" aria-label="Selected planet">
        <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap min-w-0 overflow-hidden">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-text-primary font-semibold font-heading text-sm sm:text-base leading-tight truncate flex-1 min-w-0">{planet.name}</span>
                <span className="text-text-tertiary text-[10px] sm:text-xs font-mono whitespace-nowrap flex-shrink-0">Solar System</span>
              </div>
              <span className="text-text-tertiary text-[9px] sm:text-[10px] font-mono">Demo</span>
            </div>
            <div className="hidden md:flex items-center gap-4 border-l border-white/[0.08] pl-4 flex-shrink-0">
              <div className="flex flex-col items-start">
                <span className="text-text-tertiary text-[9px] font-mono uppercase tracking-wider leading-none">Distance</span>
                <span className="text-text-primary text-xs font-mono">{fmt(planet.distance, ' AU')}</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-text-tertiary text-[9px] font-mono uppercase tracking-wider leading-none">Radius</span>
                <span className="text-text-primary text-xs font-mono">{fmt(planet.radius, ' R⊕')}</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-text-tertiary text-[9px] font-mono uppercase tracking-wider leading-none">Mass</span>
                <span className="text-text-primary text-xs font-mono">{fmt(planet.mass, ' M⊕')}</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-text-tertiary text-[9px] font-mono uppercase tracking-wider leading-none">Period</span>
                <span className="text-text-primary text-xs font-mono">{fmt(planet.orbitalPeriod, ' yr')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] sm:text-xs font-mono flex-shrink-0">
            <span className="text-text-tertiary">Mode: <span className="text-text-secondary">{modeLabel}</span></span>
            <button 
              type="button" 
              className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary px-1" 
              onClick={() => requestCameraFocus({ kind: 'planet', id: planet.id })}
            >
              Focus
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Star selection
  const starAny = starSystem.star as unknown as Record<string, unknown>;
  return (
    <div className="border-t border-white/[0.08] bg-[rgba(5,6,10,0.98)] backdrop-blur-md px-3 sm:px-5 py-1.5 sm:py-2" role="region" aria-label="Selected star">
      <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-text-primary font-semibold font-heading text-sm sm:text-base leading-tight truncate flex-1 min-w-0">{starSystem.star.name}</span>
              <span className="text-text-tertiary text-[10px] sm:text-xs font-mono whitespace-nowrap flex-shrink-0">Host Star</span>
            </div>
            <span className="text-text-tertiary text-[9px] sm:text-[10px] font-mono">Demo</span>
          </div>
          <div className="hidden md:flex items-center gap-4 border-l border-white/[0.08] pl-4 flex-shrink-0">
            <div className="flex flex-col items-start">
              <span className="text-text-tertiary text-[9px] font-mono uppercase tracking-wider leading-none">Temp</span>
              <span className="text-text-primary text-xs font-mono">{fmt(starAny.temperature, ' K')}</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-text-tertiary text-[9px] font-mono uppercase tracking-wider leading-none">Mass</span>
              <span className="text-text-primary text-xs font-mono">{fmt(starAny.mass, ' M☉')}</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-text-tertiary text-[9px] font-mono uppercase tracking-wider leading-none">HZ (Cons.)</span>
              <span className="text-text-primary text-xs font-mono">{HZ_CONSERVATIVE.inner}–{HZ_CONSERVATIVE.outer}</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-text-tertiary text-[9px] font-mono uppercase tracking-wider leading-none">HZ (Opt.)</span>
              <span className="text-text-primary text-xs font-mono">{HZ_OPTIMISTIC.inner}–{HZ_OPTIMISTIC.outer}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] sm:text-xs font-mono flex-shrink-0">
          <span className="text-text-tertiary">Mode: <span className="text-text-secondary">{modeLabel}</span></span>
          <button 
            type="button" 
            className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary px-1" 
            onClick={() => requestCameraFocus({ kind: 'star' })}
          >
            Focus
          </button>
        </div>
      </div>
    </div>
  );
}
