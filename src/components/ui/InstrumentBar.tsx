"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';

export const InstrumentBar = () => {
  const {
    activePanel,
    setActivePanel,
    autoRotate,
    setAutoRotate,
    visualizationMode,
    setVisualizationMode,
    discoveryView,
    setDiscoveryView,
    requestCameraReset,
    requestCameraFocus,
    selectedSolarSystemPlanet,
  } = useApp();

  const openDiscoveryList = () => {
    setDiscoveryView('list');
    setActivePanel('discovery');
  };

  const openDiscoveryDetail = () => {
    setDiscoveryView('detail');
    setActivePanel('discovery');
  };

  const toggleHabitable = () => {
    setVisualizationMode(visualizationMode === 'habitable' ? 'orbital' : 'habitable');
  };

  const btn = (active?: boolean) =>
    `h-8 px-2 sm:px-3 inline-flex items-center justify-center text-[11px] sm:text-xs font-medium transition-colors rounded-none border border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
      active ? 'text-primary bg-white/[0.04]' : 'text-text-secondary hover:text-primary'
    }`;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-12 bg-[rgba(5,6,10,0.98)] backdrop-blur-md border-b border-white/[0.06]"
      role="navigation"
      aria-label="Instrument controls"
    >
      <div className="h-full w-full px-2 sm:px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <span className="font-heading text-sm font-semibold text-text-primary tracking-wide truncate">
            Deep Field Observatory
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
          <button type="button" className={btn(activePanel === 'discovery' && discoveryView === 'list')} onClick={openDiscoveryList} aria-pressed={activePanel === 'discovery' && discoveryView === 'list'}>
            Discoveries
          </button>
          <button type="button" className={btn(activePanel === 'analytics')} onClick={() => setActivePanel('analytics')} aria-pressed={activePanel === 'analytics'}>
            Analytics
          </button>
          <button type="button" className={btn(visualizationMode === 'habitable')} onClick={toggleHabitable} aria-pressed={visualizationMode === 'habitable'} title="Toggle habitable zone overlay">
            HZ
          </button>
          <button type="button" className={btn(autoRotate)} onClick={() => setAutoRotate(!autoRotate)} aria-pressed={autoRotate} title="Toggle planetary orbital motion">
            {autoRotate ? 'Rotate ON' : 'Rotate OFF'}
          </button>
          <button
            type="button"
            className={btn(false)}
            onClick={() => requestCameraFocus(selectedSolarSystemPlanet ? { kind: 'planet', id: selectedSolarSystemPlanet } : { kind: 'star' })}
            title="Focus camera on selected object"
          >
            Focus
          </button>
          <button
            type="button"
            className={btn(false)}
            onClick={requestCameraReset}
            title="Restore the default full-system camera view (keeps current selection, mode, and panels)"
            aria-label="Reset camera to default full-system view"
          >
            Reset
          </button>
          <button type="button" className={btn(activePanel === 'discovery' && discoveryView === 'detail')} onClick={openDiscoveryDetail} aria-pressed={activePanel === 'discovery' && discoveryView === 'detail'}>
            Detail
          </button>
          <button type="button" className={btn(activePanel === 'about')} onClick={() => setActivePanel('about')} aria-pressed={activePanel === 'about'}>
            About
          </button>
        </div>
      </div>
    </nav>
  );
};