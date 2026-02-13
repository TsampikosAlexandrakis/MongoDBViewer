import React from 'react';
import { useConnectionStore } from '../../store/connectionStore';
import { useNavigationStore, TabType } from '../../store/navigationStore';

const tabs: { key: TabType; label: string }[] = [
  { key: 'documents', label: 'Documents' },
  { key: 'indexes', label: 'Indexes' },
  { key: 'aggregation', label: 'Aggregation' },
  { key: 'schema', label: 'Schema' },
];

export default function Toolbar() {
  const { uri, disconnect } = useConnectionStore();
  const { activeDb, activeCollection, activeTab, setActiveTab } = useNavigationStore();

  return (
    <div className="flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 h-10">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-emerald-400">MongoDB Viewer</span>
        {activeDb && (
          <span className="text-xs text-zinc-400">
            {activeDb}{activeCollection && ` / ${activeCollection}`}
          </span>
        )}
      </div>

      {activeCollection && (
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                activeTab === tab.key
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-[10px] text-zinc-500 max-w-[200px] truncate">{uri}</span>
        <button
          onClick={disconnect}
          className="text-xs text-zinc-400 hover:text-red-400 transition-colors"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
