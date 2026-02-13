import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface Props {
  db: string;
  collection: string;
}

interface SchemaField {
  path: string;
  types: Array<{ type: string; count: number; percentage: number }>;
  probability: number;
}

const typeColors: Record<string, string> = {
  string: 'bg-green-500',
  number: 'bg-blue-500',
  boolean: 'bg-yellow-500',
  object: 'bg-purple-500',
  array: 'bg-orange-500',
  ObjectId: 'bg-pink-500',
  date: 'bg-cyan-500',
  null: 'bg-zinc-500',
};

export default function SchemaView({ db, collection }: Props) {
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [sampleSize, setSampleSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getSchema(db, collection, 1000);
      setFields(result.fields);
      setSampleSize(result.sampleSize);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { analyze(); }, [db, collection]);

  const getDepth = (path: string) => path.split('.').length - 1;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Schema Analysis</h2>
          {sampleSize > 0 && (
            <span className="text-[10px] text-zinc-500">Based on {sampleSize} sampled documents</span>
          )}
        </div>
        <button
          onClick={analyze}
          disabled={loading}
          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded text-xs font-medium text-white"
        >
          {loading ? 'Analyzing...' : 'Re-analyze'}
        </button>
      </div>

      {error && <div className="mb-3 text-xs text-red-400 bg-red-950/50 rounded px-3 py-2">{error}</div>}

      {loading ? (
        <div className="text-zinc-500 text-sm">Analyzing schema...</div>
      ) : (
        <div className="space-y-1">
          {fields.map((field) => {
            const depth = getDepth(field.path);
            const fieldName = field.path.split('.').pop()!;

            return (
              <div
                key={field.path}
                className="flex items-center gap-3 py-1.5 px-3 hover:bg-zinc-900 rounded"
                style={{ paddingLeft: 12 + depth * 20 }}
              >
                <span className="text-xs font-mono text-zinc-200 min-w-[140px]">{fieldName}</span>

                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-4 bg-zinc-800 rounded overflow-hidden flex">
                    {field.types.map((t) => (
                      <div
                        key={t.type}
                        className={`${typeColors[t.type] || 'bg-zinc-600'} h-full`}
                        style={{ width: `${t.percentage}%` }}
                        title={`${t.type}: ${t.percentage}%`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 min-w-[200px]">
                  {field.types.map((t) => (
                    <span key={t.type} className="text-[10px] text-zinc-400">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${typeColors[t.type] || 'bg-zinc-600'}`} />
                      {t.type} {t.percentage}%
                    </span>
                  ))}
                </div>

                <span className="text-[10px] text-zinc-500 w-12 text-right">{field.probability}%</span>
              </div>
            );
          })}

          {fields.length === 0 && !loading && (
            <div className="text-zinc-500 text-sm text-center py-8">No fields found</div>
          )}
        </div>
      )}
    </div>
  );
}
