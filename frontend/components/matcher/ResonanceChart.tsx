/**
 * ResonanceChart
 * Visualizes resonance frequency with optimal range using Recharts
 */

'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ResonanceResult } from '@/types/matcher';

interface ResonanceChartProps {
  resonance: ResonanceResult;
}

export default function ResonanceChart({ resonance }: ResonanceChartProps) {
  const { resonanceFrequency, isOptimal } = resonance;

  // Create data points for the chart
  const data = [
    { freq: 6, height: 20, label: '6 Hz' },
    { freq: 7, height: 40, label: '7 Hz' },
    { freq: 8, height: 60, label: '8 Hz' },
    { freq: 9, height: 80, label: '9 Hz' },
    { freq: 10, height: 100, label: '10 Hz' },
    { freq: 11, height: 80, label: '11 Hz' },
    { freq: 12, height: 60, label: '12 Hz' },
    { freq: 13, height: 40, label: '13 Hz' },
    { freq: 14, height: 20, label: '14 Hz' },
  ];

  // Find the closest data point to the resonance frequency
  const closestIndex = data.reduce((prev, curr, idx) => {
    return Math.abs(curr.freq - resonanceFrequency) < Math.abs(data[prev].freq - resonanceFrequency)
      ? idx
      : prev;
  }, 0);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* X Axis - Frequency */}
          <XAxis
            dataKey="freq"
            label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -10 }}
            tick={{ fill: '#6b7280' }}
          />

          {/* Y Axis - Visual representation */}
          <YAxis
            hide
          />

          {/* Optimal Range Area (8-12 Hz) */}
          <ReferenceArea
            x1={7.5}
            x2={12.5}
            fill="#10b981"
            fillOpacity={0.1}
            label={{
              value: 'Optimal Range (8-12 Hz)',
              position: 'top',
              fill: '#059669',
              fontSize: 12,
            }}
          />

          {/* Calculated Resonance Line */}
          <ReferenceLine
            x={resonanceFrequency}
            stroke={isOptimal ? '#10b981' : '#ef4444'}
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: `${resonanceFrequency.toFixed(1)} Hz`,
              position: 'top',
              fill: isOptimal ? '#059669' : '#dc2626',
              fontSize: 14,
              fontWeight: 'bold',
            }}
          />

          {/* Tooltip */}
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                    <p className="text-sm font-medium">{payload[0].payload.label}</p>
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Bars */}
          <Bar dataKey="height" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  index === closestIndex
                    ? isOptimal
                      ? '#10b981'
                      : '#ef4444'
                    : entry.freq >= 8 && entry.freq <= 12
                    ? '#60a5fa'
                    : '#cbd5e1'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-700">Calculated (Optimal)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-700">Calculated (Sub-optimal)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400 rounded"></div>
          <span className="text-gray-700">Optimal Range (8-12 Hz)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-300 rounded"></div>
          <span className="text-gray-700">Outside Range</span>
        </div>
      </div>

      {/* Status Message */}
      <div className={`mt-4 p-4 rounded-lg ${isOptimal ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <p className={`text-sm ${isOptimal ? 'text-green-800' : 'text-yellow-800'}`}>
          {resonance.recommendation}
        </p>
      </div>
    </div>
  );
}
