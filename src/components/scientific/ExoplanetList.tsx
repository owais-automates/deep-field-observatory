"use client";

import React, { useState } from 'react';
import { ExoplanetCard } from './ExoplanetCard';
import { ExoplanetData } from '@/types';

interface ExoplanetListProps {
  exoplanets: ExoplanetData[];
}

export const ExoplanetList: React.FC<ExoplanetListProps> = ({ exoplanets }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExoplanets = exoplanets.filter((exoplanet) =>
    exoplanet.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search exoplanets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-[rgba(10,14,26,0.96)] border border-white/[0.08] text-text-primary text-sm font-mono placeholder:text-text-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredExoplanets.map((exoplanet) => (
          <ExoplanetCard key={exoplanet.id} exoplanet={exoplanet} />
        ))}
      </div>

      {filteredExoplanets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-tertiary text-sm font-mono">
            No exoplanets found matching your search.
          </p>
        </div>
      )}
    </div>
  );
};