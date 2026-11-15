"use client";

import React from 'react';
import { ExoplanetData } from '@/types';
import { useApp } from '@/context/AppContext';

interface ExoplanetCardProps {
  exoplanet: ExoplanetData;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export const ExoplanetCard: React.FC<ExoplanetCardProps> = ({
  exoplanet,
  isSelected = false,
  onSelect,
}) => {
  const {
    selectedExoplanet,
    selectExoplanet,
    discoveryView,
    setDiscoveryView,
    activePanel,
    setActivePanel,
  } = useApp();

  const selected = isSelected || selectedExoplanet === exoplanet.id;

  const handleSelect = () => {
    if (onSelect) {
      onSelect(exoplanet.id);
      return;
    }
    selectExoplanet(exoplanet.id);
    setDiscoveryView('detail');
    setActivePanel('discovery');
  };

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex items-center justify-between gap-3 py-1 border-b border-white/[0.04] last:border-b-0">
      <span className="text-text-tertiary text-xs font-mono uppercase tracking-wider">{label}</span>
      <span className="text-text-primary text-xs font-mono tabular-nums text-right">{value}</span>
    </div>
  );

  return (
    <div
      className={`exoplanet-card ${selected ? 'is-selected' : ''}`}
      onClick={handleSelect}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-text-primary font-heading leading-tight truncate">
          {exoplanet.name}
        </h3>
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary border border-white/[0.08] px-2 py-0.5">
          Exoplanet
        </span>
      </div>

      <div className="space-y-0">
        {row('Distance', `${exoplanet.distance.toFixed(2)} ly`)}
        {row('Mass', `${exoplanet.mass.toFixed(2)} M⊕`)}
        {row('Radius', `${exoplanet.radius.toFixed(2)} R⊕`)}
        {row('Discovered', String(exoplanet.discoveryYear))}
      </div>
    </div>
  );
};