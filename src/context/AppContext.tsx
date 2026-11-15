'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type PanelType = 'none' | 'discovery' | 'analytics' | 'about';
export type DiscoveryViewType = 'list' | 'detail';
export type VisualizationModeType = 'orbital' | 'habitable';
export type SceneFocusTarget = { kind: 'star' } | { kind: 'planet'; id: string } | null;

interface AppContextType {
  activePanel: PanelType;
  setActivePanel: (panel: PanelType) => void;
  selectedSolarSystemPlanet: string | null;
  setSelectedSolarSystemPlanet: (planetId: string | null) => void;
  selectedExoplanet: string | null;
  setSelectedExoplanet: (exoplanetId: string | null) => void;
  // Unified selection: switching domains clears the other so the selector,
  // 3D scene, detail panel, and ribbon always agree on one canonical object.
  selectSolarSystemPlanet: (planetId: string | null) => void;
  selectExoplanet: (exoplanetId: string | null) => void;
  discoveryView: DiscoveryViewType;
  setDiscoveryView: (view: DiscoveryViewType) => void;
  visualizationMode: VisualizationModeType;
  setVisualizationMode: (mode: VisualizationModeType) => void;
  autoRotate: boolean;
  setAutoRotate: (autoRotate: boolean) => void;
  cameraResetNonce: number;
  requestCameraReset: () => void;
  cameraFocusTarget: SceneFocusTarget;
  requestCameraFocus: (target: SceneFocusTarget) => void;
  reducedMotion: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [activePanel, setActivePanelState] = useState<PanelType>('none');
  const [selectedSolarSystemPlanet, setSelectedSolarSystemPlanet] = useState<string | null>(null);
  const [selectedExoplanet, setSelectedExoplanet] = useState<string | null>(null);
  const [discoveryView, setDiscoveryView] = useState<DiscoveryViewType>('list');
  const [visualizationMode, setVisualizationMode] = useState<VisualizationModeType>('orbital');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [cameraResetNonce, setCameraResetNonce] = useState(0);
  const [cameraFocusTarget, setCameraFocusTarget] = useState<SceneFocusTarget>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply);
    else mq.addListener(apply);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', apply);
      else mq.removeListener(apply);
    };
  }, []);

  const setActivePanel = (panel: PanelType) => {
    setActivePanelState((prev) => (prev === panel ? 'none' : panel));
  };

  const selectSolarSystemPlanet = (planetId: string | null) => {
    setSelectedExoplanet(null);
    setSelectedSolarSystemPlanet(planetId);
  };

  const selectExoplanet = (exoplanetId: string | null) => {
    setSelectedSolarSystemPlanet(null);
    setSelectedExoplanet(exoplanetId);
  };

  return (
    <AppContext.Provider
      value={{
        activePanel,
        setActivePanel,
        selectedSolarSystemPlanet,
        setSelectedSolarSystemPlanet,
        selectSolarSystemPlanet,
        selectedExoplanet,
        setSelectedExoplanet,
        selectExoplanet,
        discoveryView,
        setDiscoveryView,
        visualizationMode,
        setVisualizationMode,
        autoRotate,
        setAutoRotate,
        cameraResetNonce,
        requestCameraReset: () => setCameraResetNonce((n) => n + 1),
        cameraFocusTarget,
        requestCameraFocus: setCameraFocusTarget,
        reducedMotion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};