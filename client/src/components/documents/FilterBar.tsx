import React from 'react';

interface FilterBarProps {
  filter: string;
  sort: string;
  projection: string;
  limit: number;
  onFilterChange: (v: string) => void;
  onSortChange: (v: string) => void;
  onProjectionChange: (v: string) => void;
  onLimitChange: (v: number) => void;
  onApply: () => void;
}

export default function FilterBar({
  filter, sort, projection, limit,
  onFilterChange, onSortChange, onProjectionChange, onLimitChange, onApply,
}: FilterBarProps) {
  return (
    <div className="flex items-end gap-2 p-3 bg-zinc-900 border-b border-zinc-700">
      <div className="flex-1">
        <label className="block text-[10px] text-zinc-500 mb-0.5">Filter</label>
        <input
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onApply()}
          className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-600 rounded text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
          placeholder='{ "field": "value" }'
        />
      </div>
      <div className="w-40">
        <label className="block text-[10px] text-zinc-500 mb-0.5">Sort</label>
        <input
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onApply()}
          className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-600 rounded text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
          placeholder='{ "_id": -1 }'
        />
      </div>
      <div className="w-40">
        <label className="block text-[10px] text-zinc-500 mb-0.5">Projection</label>
        <input
          value={projection}
          onChange={(e) => onProjectionChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onApply()}
          className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-600 rounded text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
          placeholder='{ "field": 1 }'
        />
      </div>
      <div className="w-20">
        <label className="block text-[10px] text-zinc-500 mb-0.5">Limit</label>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-600 rounded text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <button
        onClick={onApply}
        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-medium text-white transition-colors"
      >
        Find
      </button>
    </div>
  );
}
