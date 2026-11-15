'use client';

import React, { useState } from 'react';
import { ExoplanetCard } from '@/components/scientific/ExoplanetCard';
import { ExoplanetDetail } from '@/components/ui/ExoplanetDetail';
import { useApp } from '@/context/AppContext';
import { ExoplanetData } from '@/types';

type PanelType = 'none' | 'discovery' | 'analytics' | 'about';
type DiscoveryViewType = 'list' | 'detail';

export interface DiscoveryFeedProps {
  exoplanets: ExoplanetData[];
  // New/Phase 2 shell API
  isExpanded?: boolean;
  onClose?: () => void;
  // Legacy/Phase 1 API (optional for compatibility)
  activePanel?: PanelType;
  setActivePanel?: (panel: PanelType) => void;
  selectedExoplanet?: string | null;
  setSelectedExoplanet?: (exoplanetId: string | null) => void;
  discoveryView?: DiscoveryViewType;
  setDiscoveryView?: (view: DiscoveryViewType) => void;
}

export const DiscoveryFeed = (props: DiscoveryFeedProps) => {
  const { exoplanets } = props;
  const app = useApp();
  const activePanel = props.activePanel ?? app.activePanel;
  const setActivePanel = props.setActivePanel ?? app.setActivePanel;
  const selectedExoplanet = props.selectedExoplanet ?? app.selectedExoplanet;
  const setSelectedExoplanet = props.setSelectedExoplanet ?? app.setSelectedExoplanet;
  const discoveryView = props.discoveryView ?? app.discoveryView;
  const setDiscoveryView = props.setDiscoveryView ?? app.setDiscoveryView;

  const [localExpanded, setLocalExpanded] = useState<boolean>(false);
  const expanded = (props.isExpanded ?? false) || localExpanded || activePanel === 'discovery';

  const closePanel = () => {
    setLocalExpanded(false);
    setActivePanel('none');
    props.onClose?.();
  };

  return (
    <div
      className={`absolute bottom-0 right-0 z-40 pointer-events-auto flex flex-col ${
        expanded
          ? 'left-0 md:left-auto md:top-12 md:bottom-4 md:right-4 md:w-[360px] md:max-w-[calc(100vw-2rem)]'
          : 'left-0 md:left-auto md:right-4 md:w-auto'
      }`}
    >
      {/* Handle */}
      <div
        className={`cursor-pointer select-none px-4 py-2 bg-[rgba(5,6,10,0.98)] backdrop-blur-md border border-white/[0.06] ${
          expanded ? 'md:rounded-t-[2px] border-b-0' : 'rounded-t-[2px]'
        }`}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse exoplanet discoveries' : 'Expand exoplanet discoveries'}
        onClick={(e) => {
          e.stopPropagation();
          if (props.isExpanded !== undefined) {
            if (expanded) closePanel();
            else setActivePanel('discovery');
            return;
          }
          const next = !expanded;
          setLocalExpanded(next);
          setActivePanel(next ? 'discovery' : 'none');
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            (e.currentTarget as HTMLDivElement).click();
          }
        }}
      >
        <span className="inline-flex items-center gap-2 text-text-tertiary text-xs">
          <span className="w-2 h-2 rounded-full bg-primary" />
          EXOPLANET DISCOVERIES ({exoplanets.length})
          <span className="ml-2 text-text-tertiary">{expanded ? '▼' : '▲'}</span>
        </span>
      </div>

      {/* Panel Content — reserved side space on desktop, bottom drawer on mobile */}
      {expanded && (
        <div
          className="bg-[#0A0A0A] backdrop-blur-md border border-white/[0.06] border-t-0 md:border-t overflow-y-auto p-4 max-h-[45vh] md:max-h-none md:flex-1 md:rounded-b-[2px] shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-secondary text-xs font-mono uppercase tracking-wide">
              {discoveryView === 'detail' ? 'Detail' : 'Catalog'}
            </span>
            <button
              type="button"
              onClick={closePanel}
              className="text-text-tertiary hover:text-text-primary text-xs px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Close discovery panel"
            >
              Close
            </button>
          </div>
          {discoveryView === 'detail' ? (
            selectedExoplanet ? (
              <ExoplanetDetail exoplanetId={selectedExoplanet} exoplanets={exoplanets} />
            ) : (
              <div className="text-text-tertiary text-sm p-2">
                No exoplanet selected. Choose a discovery from the catalog.
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setDiscoveryView('list')}
                    className="px-3 py-1.5 rounded bg-primary/20 text-primary border border-primary/30 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Show catalog
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {exoplanets.map((exoplanet) => (
                <ExoplanetCard key={exoplanet.id} exoplanet={exoplanet} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};