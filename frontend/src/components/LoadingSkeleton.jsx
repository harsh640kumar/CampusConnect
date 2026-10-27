import React from 'react';

export const EventCardSkeleton = () => (
  <div className="rounded-2xl glass-card overflow-hidden border border-slate-800 p-0 animate-pulse">
    <div className="h-44 bg-slate-800/80 w-full" />
    <div className="p-5 space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-800 rounded w-24" />
        <div className="h-4 bg-slate-800 rounded w-16" />
      </div>
      <div className="h-6 bg-slate-800 rounded w-4/5" />
      <div className="h-4 bg-slate-800 rounded w-full" />
      <div className="h-4 bg-slate-800 rounded w-2/3" />
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="h-4 bg-slate-800 rounded w-20" />
        <div className="h-8 bg-slate-800 rounded-xl w-24" />
      </div>
    </div>
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="animate-pulse border-b border-slate-800/60">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <div className="h-4 bg-slate-800 rounded w-3/4" />
      </td>
    ))}
  </tr>
);

export const MetricSkeleton = () => (
  <div className="rounded-2xl glass-panel p-5 border border-slate-800 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-4 bg-slate-800 rounded w-20" />
        <div className="h-8 bg-slate-800 rounded w-16" />
      </div>
      <div className="w-12 h-12 rounded-xl bg-slate-800" />
    </div>
  </div>
);
