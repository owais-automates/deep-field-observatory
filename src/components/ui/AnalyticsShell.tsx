'use client';

import React, { useEffect, useState } from 'react';
import { DataVisualizationDashboard } from '@/components/scientific/DataVisualizationDashboard';
import { Dataset } from '@/types';

export interface AnalyticsShellProps {
  datasets: Dataset[];
  isOpen: boolean;
  onClose: () => void;
  onExited?: () => void;
}

const PANEL_MS = 220; // restrained enter/exit (180–250ms)

export const AnalyticsShell = ({
  datasets,
  isOpen,
  onClose,
  onExited,
}: AnalyticsShellProps) => {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEntered(false);
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);
    const t = window.setTimeout(() => onExited?.(), PANEL_MS);
    return () => clearTimeout(t);
  }, [isOpen, onExited]);

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-30 pointer-events-none flex justify-center px-2 sm:px-3 pb-2"
      aria-label="Analytics panel container"
      aria-hidden={!isOpen}
    >
      <div
        className="pointer-events-auto w-full max-w-[min(1100px,calc(100vw-1rem))] bg-[#0A0A0A]/[0.98] backdrop-blur-md border border-white/[0.08] max-h-[min(56vh,560px)] overflow-y-auto overflow-x-hidden shadow-[0_8px_32px_rgba(0,0,0,0.35)] motion-safe:transition-[opacity,transform] motion-safe:duration-[220ms] motion-safe:ease-out motion-reduce:transition-none motion-reduce:transform-none"
        style={{
          opacity: entered && isOpen ? 1 : 0,
          transform: entered && isOpen ? 'translateY(0)' : 'translateY(8px)',
        }}
      >
        <div className="sticky top-0 z-10 flex justify-between items-center gap-3 px-3 sm:px-4 py-2.5 bg-[#0A0A0A]/[0.98] border-b border-white/[0.06]">
          <h2 className="text-text-primary text-sm sm:text-base font-semibold font-heading truncate">Data visualization</h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-text-tertiary text-xs sm:text-sm hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary px-2 py-1"
            aria-label="Close analytics panel"
          >
            Close
          </button>
        </div>

        <div className="px-3 sm:px-4 py-3 min-w-0">
          <DataVisualizationDashboard
            datasets={datasets}
            selectedMetrics={[
              { id: 'discoveries', name: 'Exoplanet Discoveries', unit: 'count' },
              { id: 'mass', name: 'Average Mass', unit: 'M⊕' },
              { id: 'radius', name: 'Average Radius', unit: 'R⊕' }
            ]}
            timeRange={{ start: new Date(2000, 0, 1), end: new Date(2020, 0, 1) }}
            embedded
          />
        </div>
      </div>
    </div>
  );
};