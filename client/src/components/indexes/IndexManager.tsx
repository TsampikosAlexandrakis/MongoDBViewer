import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface Props {
  db: string;
  collection: string;
}

interface IndexField {
  field: string;
  direction: 1 | -1 | 'text';
}

export default function IndexManager({ db, collection }: Props) {
  const [indexes, setIndexes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [fields, setFields] = useState<IndexField[]>([{ field: '', direction: 1 }]);
  const [unique, setUnique] = useState(false);
  const [sparse, setSparse] = useState(false);
  const [indexName, setIndexName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchIndexes = async () => {
    setLoading(true);
    try {
      const result = await api.listIndexes(db, collection);
      setIndexes(result);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchIndexes(); }, [db, collection]);

  const handleCreate = async () => {
    const keys: Record<string, any> = {};
    for (const f of fields) {
      if (f.field.trim()) keys[f.field.trim()] = f.direction;
    }
    if (Object.keys(keys).length === 0) return;

    const options: any = {};
    if (unique) options.unique = true;
    if (sparse) options.sparse = true;
    if (indexName.trim()) options.name = indexName.trim();

    try {
      setError(null);
      await api.createIndex(db, collection, keys, options);
      setShowCreate(false);
      setFields([{ field: '', direction: 1 }]);
      setUnique(false);
      setSparse(false);
      setIndexName('');
      fetchIndexes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDrop = async (name: string) => {
    if (name === '_id_') return;
    if (!confirm(`Drop index "${name}"?`)) return;
    try {
      await api.dropIndex(db, collection, name);
      fetchIndexes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-200">Indexes</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-medium text-white"
        >
          {showCreate ? 'Cancel' : '+ Create Index'}
        </button>
      </div>

      {error && <div className="mb-3 text-xs text-red-400 bg-red-950/50 rounded px-3 py-2">{error}</div>}

      {showCreate && (
        <div className="mb-4 p-4 bg-zinc-900 border border-zinc-700 rounded">
          <div className="space-y-2 mb-3">
            {fields.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={f.field}
                  onChange={(e) => {
                    const updated = [...fields];
                    updated[i].field = e.target.value;
                    setFields(updated);
                  }}
                  className="flex-1 px-2 py-1.5 bg-zinc-800 border border-zinc-600 rounded text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                  placeholder="Field name"
                />
                <select
                  value={String(f.direction)}
                  onChange={(e) => {
                    const updated = [...fields];
                    const val = e.target.value;
                    updated[i].direction = val === 'text' ? 'text' : Number(val) as 1 | -1;
                    setFields(updated);
                  }}
                  className="w-24 px-2 py-1.5 bg-zinc-800 border border-zinc-600 rounded text-xs text-zinc-100"
                >
                  <option value="1">Asc (1)</option>
                  <option value="-1">Desc (-1)</option>
                  <option value="text">Text</option>
                </select>
                {fields.length > 1 && (
                  <button
                    onClick={() => setFields(fields.filter((_, j) => j !== i))}
                    className="text-zinc-500 hover:text-red-400 text-xs"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setFields([...fields, { field: '', direction: 1 }])}
            className="text-xs text-emerald-400 hover:text-emerald-300 mb-3 block"
          >
            + Add field
          </button>
          <div className="flex items-center gap-4 mb-3">
            <input
              value={indexName}
              onChange={(e) => setIndexName(e.target.value)}
              className="px-2 py-1.5 bg-zinc-800 border border-zinc-600 rounded text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
              placeholder="Index name (optional)"
            />
            <label className="flex items-center gap-1 text-xs text-zinc-300">
              <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} className="rounded bg-zinc-800" />
              Unique
            </label>
            <label className="flex items-center gap-1 text-xs text-zinc-300">
              <input type="checkbox" checked={sparse} onChange={(e) => setSparse(e.target.checked)} className="rounded bg-zinc-800" />
              Sparse
            </label>
          </div>
          <button onClick={handleCreate} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-medium text-white">
            Create Index
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-zinc-500 text-sm">Loading indexes...</div>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left px-3 py-2 font-medium text-zinc-400">Name</th>
              <th className="text-left px-3 py-2 font-medium text-zinc-400">Keys</th>
              <th className="text-left px-3 py-2 font-medium text-zinc-400">Properties</th>
              <th className="px-3 py-2 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {indexes.map((idx) => (
              <tr key={idx.name} className="border-b border-zinc-800/50 hover:bg-zinc-900/80">
                <td className="px-3 py-2 text-zinc-300 font-mono">{idx.name}</td>
                <td className="px-3 py-2 text-zinc-400 font-mono">{JSON.stringify(idx.key)}</td>
                <td className="px-3 py-2 text-zinc-400">
                  {idx.unique && <span className="mr-2 text-yellow-400">unique</span>}
                  {idx.sparse && <span className="mr-2 text-blue-400">sparse</span>}
                </td>
                <td className="px-3 py-2">
                  {idx.name !== '_id_' && (
                    <button
                      onClick={() => handleDrop(idx.name)}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      Drop
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
