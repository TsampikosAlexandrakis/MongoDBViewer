import React, { useState } from 'react';
import { api } from '../../api/client';
import JsonEditor from '../common/JsonEditor';
import TreeView from '../common/TreeView';

interface Props {
  db: string;
  collection: string;
}

interface Stage {
  id: string;
  type: string;
  value: string;
  enabled: boolean;
}

const stageTypes = ['$match', '$group', '$sort', '$project', '$limit', '$unwind', '$lookup', '$addFields', '$count', '$skip'];

const stageTemplates: Record<string, string> = {
  '$match': '{\n  "field": "value"\n}',
  '$group': '{\n  "_id": "$field",\n  "count": { "$sum": 1 }\n}',
  '$sort': '{\n  "field": 1\n}',
  '$project': '{\n  "field": 1,\n  "_id": 0\n}',
  '$limit': '10',
  '$unwind': '"$arrayField"',
  '$lookup': '{\n  "from": "otherCollection",\n  "localField": "field",\n  "foreignField": "_id",\n  "as": "joined"\n}',
  '$addFields': '{\n  "newField": "expression"\n}',
  '$count': '"total"',
  '$skip': '0',
};

let nextId = 0;

export default function PipelineBuilder({ db, collection }: Props) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [results, setResults] = useState<any[] | null>(null);
  const [resultCount, setResultCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const addStage = (type: string) => {
    setStages([...stages, {
      id: String(++nextId),
      type,
      value: stageTemplates[type] || '{}',
      enabled: true,
    }]);
  };

  const removeStage = (id: string) => {
    setStages(stages.filter((s) => s.id !== id));
  };

  const updateStage = (id: string, updates: Partial<Stage>) => {
    setStages(stages.map((s) => s.id === id ? { ...s, ...updates } : s));
  };

  const moveStage = (from: number, to: number) => {
    const updated = [...stages];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setStages(updated);
  };

  const runPipeline = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const pipeline = stages
        .filter((s) => s.enabled)
        .map((s) => {
          const val = JSON.parse(s.value);
          return { [s.type]: val };
        });

      const result = await api.aggregate(db, collection, pipeline);
      setResults(result.results);
      setResultCount(result.count);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      moveStage(dragIdx, idx);
      setDragIdx(idx);
    }
  };
  const handleDragEnd = () => setDragIdx(null);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 bg-zinc-900 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-200">Aggregation Pipeline</h2>
          <select
            onChange={(e) => { if (e.target.value) addStage(e.target.value); e.target.value = ''; }}
            className="px-2 py-1 bg-zinc-800 border border-zinc-600 rounded text-xs text-zinc-100"
            defaultValue=""
          >
            <option value="" disabled>+ Add Stage</option>
            {stageTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <button
          onClick={runPipeline}
          disabled={loading || stages.length === 0}
          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded text-xs font-medium text-white"
        >
          {loading ? 'Running...' : 'Run Pipeline'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 overflow-y-auto border-r border-zinc-700 p-3 space-y-2">
          {stages.length === 0 && (
            <div className="text-zinc-500 text-sm text-center py-8">
              Add stages to build your pipeline
            </div>
          )}
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`bg-zinc-900 border rounded ${stage.enabled ? 'border-zinc-700' : 'border-zinc-800 opacity-50'}`}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="cursor-grab text-zinc-600 text-xs">⠿</span>
                  <span className="text-xs font-mono font-semibold text-emerald-400">{stage.type}</span>
                  <span className="text-[10px] text-zinc-600">Stage {idx + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateStage(stage.id, { enabled: !stage.enabled })}
                    className={`text-[10px] ${stage.enabled ? 'text-emerald-400' : 'text-zinc-500'}`}
                  >
                    {stage.enabled ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => removeStage(stage.id)}
                    className="text-zinc-500 hover:text-red-400 text-xs"
                  >
                    &times;
                  </button>
                </div>
              </div>
              <div className="p-2">
                <JsonEditor
                  value={stage.value}
                  onChange={(v) => updateStage(stage.id, { value: v })}
                  height="120px"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="w-1/2 overflow-y-auto p-3">
          <div className="text-xs text-zinc-400 mb-2">
            {results !== null ? `Results (${resultCount})` : 'Results will appear here'}
          </div>
          {error && <div className="text-xs text-red-400 bg-red-950/50 rounded px-3 py-2 mb-2">{error}</div>}
          {results && (
            <div className="space-y-2">
              {results.map((doc, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-700 rounded p-3">
                  <TreeView data={doc} />
                </div>
              ))}
              {results.length === 0 && (
                <div className="text-zinc-500 text-sm text-center py-8">No results</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
