"use client";

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Dataset, Metric, TimeRange } from '@/types';
import { useApp } from '@/context/AppContext';

interface DataVisualizationDashboardProps {
  datasets: Dataset[];
  selectedMetrics: Metric[];
  timeRange: TimeRange;
  embedded?: boolean; // when true, avoid extra card chrome inside an existing panel
}

const SERIES_COLORS = ['#4A90E2', '#00FF88', '#FFB347'] as const;
const CHART_ANIM_DURATION = 700; // ms, restrained for instrument UI
const CHART_ANIM_EASING = 'ease-out';
const CHART_SWITCH_MS = 160; // opacity fade for line/bar swap (no Recharts morph)

export const DataVisualizationDashboard: React.FC<DataVisualizationDashboardProps> = ({
  datasets,
  selectedMetrics,
  timeRange,
  embedded = false,
}) => {
  const { reducedMotion } = useApp();
  const [selectedDataset, setSelectedDataset] = useState<string>(datasets[0]?.name || '');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [showGrid, setShowGrid] = useState(true);
  const [chartVisible, setChartVisible] = useState(true);

  const filteredData = datasets.find(ds => ds.name === selectedDataset)?.data || [];
  const animate = !reducedMotion;

  const setChartTypeSmooth = (next: 'line' | 'bar') => {
    if (next === chartType) return;
    if (reducedMotion) {
      setChartType(next);
      return;
    }
    setChartVisible(false);
    window.setTimeout(() => {
      setChartType(next);
      requestAnimationFrame(() => setChartVisible(true));
    }, CHART_SWITCH_MS);
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "X,Y\n"
      + filteredData.map(d => `${d.x},${d.y}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedDataset}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const controlBase = "px-2.5 py-1.5 text-[11px] sm:text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";
  const controlIdle = "bg-[rgba(255,255,255,0.04)] text-text-secondary border border-white/[0.08] hover:text-text-primary";
  const controlActive = "bg-primary/15 text-primary border border-primary/30";

  return (
    <div className={embedded ? "min-w-0" : "dashboard-container min-w-0"}>
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            {!embedded && <h2 className="text-base sm:text-lg font-semibold text-text-primary font-heading">Data visualization</h2>}
            <p className="text-text-tertiary text-[11px] sm:text-xs font-mono mt-0.5">
              {timeRange.start.toLocaleDateString()} – {timeRange.end.toLocaleDateString()} · demo dataset
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <label htmlFor="analytics-dataset" className="sr-only">Dataset</label>
            <select
              id="analytics-dataset"
              className={`${controlBase} ${controlIdle} max-w-full`}
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
            >
              {datasets.map((dataset) => (
                <option key={dataset.name} value={dataset.name}>{dataset.name}</option>
              ))}
            </select>

            <div className="flex border border-white/[0.08] overflow-hidden" role="group" aria-label="Chart type">
              <button type="button" onClick={() => setChartTypeSmooth('line')} className={`${controlBase} ${chartType === 'line' ? controlActive : controlIdle} border-0 border-r border-white/[0.08]`} aria-pressed={chartType === 'line'}>Line</button>
              <button type="button" onClick={() => setChartTypeSmooth('bar')} className={`${controlBase} ${chartType === 'bar' ? controlActive : controlIdle} border-0`} aria-pressed={chartType === 'bar'}>Bar</button>
            </div>

            <button type="button" onClick={() => setShowGrid(!showGrid)} className={`${controlBase} ${showGrid ? controlActive : controlIdle}`} aria-pressed={showGrid}>Grid {showGrid ? 'on' : 'off'}</button>
            <button type="button" onClick={handleExport} className={`${controlBase} ${controlIdle}`}>Export CSV</button>
          </div>
        </div>
      </div>

      {/* Explicit, non-zero dimensions for ResponsiveContainer; responsive via vw/vh clamps, no inner scrollbar */}
      <div
        className="w-full min-w-0 overflow-hidden"
        style={{ height: 'clamp(220px, 34vh, 360px)', minHeight: 220 }}
        aria-label="Chart area"
      >
        <div
          className="w-full h-full"
          style={{
            opacity: chartVisible ? 1 : 0,
            transition: reducedMotion ? 'none' : `opacity ${CHART_SWITCH_MS}ms ease-out`,
          }}
        >
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
          {chartType === 'line' ? (
            <LineChart data={filteredData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,236,241,0.08)" />}
              <XAxis dataKey="x" stroke="#8B949E" tick={{ fill: '#8B949E', fontSize: 11 }} />
              <YAxis stroke="#8B949E" tick={{ fill: '#8B949E', fontSize: 11 }} width={36} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, color: '#E8ECF1' }}
                labelStyle={{ color: '#8B949E' }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#8B949E' }} />
              {selectedMetrics.map((metric, idx) => (
                <Line
                  key={metric.id}
                  type="monotone"
                  dataKey="y"
                  name={metric.name}
                  stroke={SERIES_COLORS[idx % SERIES_COLORS.length]}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                  strokeWidth={2}
                  isAnimationActive={animate}
                  animationDuration={CHART_ANIM_DURATION}
                  animationEasing={CHART_ANIM_EASING}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={filteredData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,236,241,0.08)" />}
              <XAxis dataKey="x" stroke="#8B949E" tick={{ fill: '#8B949E', fontSize: 11 }} />
              <YAxis stroke="#8B949E" tick={{ fill: '#8B949E', fontSize: 11 }} width={36} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, color: '#E8ECF1' }}
                labelStyle={{ color: '#8B949E' }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#8B949E' }} />
              {selectedMetrics.map((metric, idx) => (
                <Bar
                  key={metric.id}
                  dataKey="y"
                  name={metric.name}
                  fill={SERIES_COLORS[idx % SERIES_COLORS.length]}
                  isAnimationActive={animate}
                  animationDuration={CHART_ANIM_DURATION}
                  animationEasing={CHART_ANIM_EASING}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};