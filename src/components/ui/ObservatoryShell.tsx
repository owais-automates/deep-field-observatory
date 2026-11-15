'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { InstrumentBar } from './InstrumentBar';
import { DiscoveryFeed } from './DiscoveryFeed';
import { AnalyticsShell } from './AnalyticsShell';
import { SelectedObjectInfoRibbon } from './SelectedObjectInfoRibbon';
import { useApp } from '@/context/AppContext';
import { StarSystemData, ExoplanetData, Dataset } from '@/types';
import { DataQualityReport } from '@/lib/validation/scientific-validator';
import { HZ_CONSERVATIVE, HZ_OPTIMISTIC } from '@/components/scientific/StarSystem3D';

const StarSystem3D = dynamic(
  () => import('@/components/scientific/StarSystem3D').then((mod) => mod.StarSystem3D),
  { ssr: false }
);

export interface ObservatoryShellProps {
  starSystem: StarSystemData;
  exoplanets: ExoplanetData[];
  datasets: Dataset[];
  qualityReport?: DataQualityReport;
}

export const ObservatoryShell = ({
  starSystem,
  exoplanets,
  datasets,
  qualityReport,
}: ObservatoryShellProps) => {
  const {
    activePanel,
    setActivePanel,
    autoRotate,
    visualizationMode,
    selectedSolarSystemPlanet,
    selectSolarSystemPlanet,
    cameraResetNonce,
    cameraFocusTarget,
    reducedMotion,
  } = useApp();
  const [analyticsMounted, setAnalyticsMounted] = useState(false);

  useEffect(() => {
    if (activePanel === 'analytics') setAnalyticsMounted(true);
  }, [activePanel]);

  return (
    <div className="relative min-h-screen bg-background">
      <InstrumentBar />

      <main
        className="relative w-full"
        style={{ height: 'calc(100vh - 48px)', marginTop: '48px' }}
      >
        <div className="absolute inset-0 z-0">
          <StarSystem3D
            systemData={starSystem}
            viewMode={visualizationMode}
            autoRotate={autoRotate}
            selectedPlanet={selectedSolarSystemPlanet}
            onPlanetSelect={selectSolarSystemPlanet}
            cameraResetNonce={cameraResetNonce}
            cameraFocusTarget={cameraFocusTarget}
            reducedMotion={reducedMotion}
          />
        </div>

        {/* Keyboard-accessible scene selector (always visible; persists across Focus/Reset/panels/modes) */}
        <div className="absolute left-2 top-2 z-20 pointer-events-auto max-w-[calc(100vw-1rem)] sm:max-w-[240px]">
          <label
            htmlFor="scene-select"
            className="block mb-1 text-[10px] sm:text-[11px] font-mono uppercase tracking-wide text-text-primary/90"
          >
            Select Object
          </label>
          <select
            id="scene-select"
            className="w-full min-w-[160px] bg-[rgba(10,14,26,0.96)] border border-primary/35 text-text-primary text-[11px] sm:text-xs font-mono px-2 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={selectedSolarSystemPlanet ?? ''}
            onChange={(e) => selectSolarSystemPlanet(e.target.value || null)}
            aria-label="Select solar system object"
            title="Select a scene object"
          >
            <option value="">No object selected</option>
            <option value="sol">Sol (star)</option>
            {starSystem.planets.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {visualizationMode === 'habitable' && (
          <div className="absolute left-2 bottom-[88px] sm:bottom-[72px] z-10 pointer-events-none">
            <div className="bg-[rgba(5,6,10,0.88)] border border-white/[0.08] px-2 py-1.5 text-[10px] sm:text-[11px] font-mono text-text-secondary">
              <div className="text-text-primary mb-0.5">Habitable Zone (AU, illustrative overlay)</div>
              <div>Conservative: {HZ_CONSERVATIVE.inner}–{HZ_CONSERVATIVE.outer} AU</div>
              <div>Optimistic: {HZ_OPTIMISTIC.inner}–{HZ_OPTIMISTIC.outer} AU</div>
              <div className="text-text-tertiary mt-0.5">Kopparapu et al. (2013); scaled visually</div>
            </div>
          </div>
        )}

        <DiscoveryFeed
          isExpanded={activePanel === 'discovery'}
          exoplanets={exoplanets}
          onClose={() => setActivePanel('none')}
        />

        {analyticsMounted && (
          <AnalyticsShell
            datasets={datasets}
            isOpen={activePanel === 'analytics'}
            onClose={() => setActivePanel('none')}
            onExited={() => setAnalyticsMounted(false)}
          />
        )}

        {activePanel === 'about' && (
          <div className="absolute right-2 top-2 z-40 w-[min(92vw,420px)] pointer-events-auto">
            <div className="bg-[#0A0A0A] border border-white/[0.08] p-3 text-xs font-mono text-text-secondary">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-text-primary font-heading text-sm">About / Provenance</h2>
                <button type="button" className="text-text-tertiary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary px-1" onClick={() => setActivePanel('none')} aria-label="Close about panel">✕</button>
              </div>
              <p>Demo visualization using mock data. Do not interpret as live NASA telemetry.</p>
              <p className="mt-1">HZ boundaries: Kopparapu et al. (2013), ApJ 765,131; erratum ApJ 770,82. HZ is a climate/orbit guide, not a habitability guarantee.</p>
              <p className="mt-1">Exoplanet host-system geometry is unavailable in current catalog mock data and shown as “Unavailable”.</p>
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30">
        <SelectedObjectInfoRibbon starSystem={starSystem} exoplanets={exoplanets} />
      </div>
    </div>
  );
};