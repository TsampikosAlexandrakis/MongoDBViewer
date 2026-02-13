import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/client';
import { useNavigationStore } from '../../store/navigationStore';

interface DbInfo {
  name: string;
  sizeOnDisk: number;
  collections?: Array<{ name: string; count: number }>;
  expanded?: boolean;
}

export default function Sidebar() {
  const [databases, setDatabases] = useState<DbInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; db: string; col?: string } | null>(null);
  const [newColDb, setNewColDb] = useState<string | null>(null);
  const [newColName, setNewColName] = useState('');
  const { activeDb, activeCollection, setActiveDb, setActiveCollection } = useNavigationStore();

  const loadDatabases = useCallback(async () => {
    setLoading(true);
    try {
      const dbs = await api.listDatabases();
      setDatabases((prev) =>
        dbs.map((db) => {
          const existing = prev.find((p) => p.name === db.name);
          return { ...db, collections: existing?.collections, expanded: existing?.expanded };
        })
      );
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadDatabases(); }, [loadDatabases]);

  const toggleDb = async (dbName: string) => {
    setDatabases((prev) =>
      prev.map((db) => {
        if (db.name !== dbName) return db;
        if (!db.expanded && !db.collections) {
          api.listCollections(dbName).then((cols) => {
            setDatabases((p) => p.map((d) => d.name === dbName ? { ...d, collections: cols } : d));
          });
        }
        return { ...db, expanded: !db.expanded };
      })
    );
    setActiveDb(dbName);
  };

  const selectCollection = (db: string, col: string) => {
    setActiveCollection(db, col);
  };

  const refreshDb = async (dbName: string) => {
    const cols = await api.listCollections(dbName);
    setDatabases((prev) => prev.map((d) => d.name === dbName ? { ...d, collections: cols } : d));
  };

  const handleContextMenu = (e: React.MouseEvent, db: string, col?: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, db, col });
  };

  const handleCreateCollection = async () => {
    if (!newColDb || !newColName.trim()) return;
    try {
      await api.createCollection(newColDb, newColName.trim());
      await refreshDb(newColDb);
      setNewColDb(null);
      setNewColName('');
    } catch {}
  };

  const handleDropCollection = async (db: string, col: string) => {
    if (!confirm(`Drop collection "${col}"?`)) return;
    try {
      await api.dropCollection(db, col);
      await refreshDb(db);
      if (activeCollection === col && activeDb === db) {
        setActiveDb(db);
      }
    } catch {}
    setContextMenu(null);
  };

  useEffect(() => {
    const handler = () => setContextMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1073741824).toFixed(1)} GB`;
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-r border-zinc-700">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-700">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Databases</span>
        <button onClick={loadDatabases} className="text-zinc-500 hover:text-zinc-300 text-xs" title="Refresh">
          {loading ? '...' : '↻'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {databases.map((db) => (
          <div key={db.name}>
            <div
              className={`flex items-center gap-1 px-3 py-1.5 cursor-pointer text-sm hover:bg-zinc-800 ${activeDb === db.name && !activeCollection ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-300'}`}
              onClick={() => toggleDb(db.name)}
              onContextMenu={(e) => handleContextMenu(e, db.name)}
            >
              <span className="text-[10px] text-zinc-500">{db.expanded ? '▼' : '▶'}</span>
              <span className="flex-1 truncate">{db.name}</span>
              <span className="text-[10px] text-zinc-600">{formatSize(db.sizeOnDisk)}</span>
            </div>

            {db.expanded && db.collections && (
              <div>
                {db.collections.map((col) => (
                  <div
                    key={col.name}
                    className={`flex items-center gap-1 pl-7 pr-3 py-1 cursor-pointer text-sm hover:bg-zinc-800 ${activeDb === db.name && activeCollection === col.name ? 'bg-zinc-800/80 text-emerald-400' : 'text-zinc-400'}`}
                    onClick={() => selectCollection(db.name, col.name)}
                    onContextMenu={(e) => handleContextMenu(e, db.name, col.name)}
                  >
                    <span className="flex-1 truncate">{col.name}</span>
                    <span className="text-[10px] text-zinc-600">{col.count}</span>
                  </div>
                ))}
                {db.collections.length === 0 && (
                  <div className="pl-7 pr-3 py-1 text-xs text-zinc-600 italic">No collections</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {contextMenu && (
        <div
          className="fixed z-50 bg-zinc-800 border border-zinc-600 rounded shadow-lg py-1 text-sm"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {!contextMenu.col && (
            <button
              className="block w-full text-left px-4 py-1.5 hover:bg-zinc-700 text-zinc-300"
              onClick={() => { setNewColDb(contextMenu.db); setContextMenu(null); }}
            >
              New Collection
            </button>
          )}
          {contextMenu.col && (
            <button
              className="block w-full text-left px-4 py-1.5 hover:bg-zinc-700 text-red-400"
              onClick={() => handleDropCollection(contextMenu.db, contextMenu.col!)}
            >
              Drop Collection
            </button>
          )}
          <button
            className="block w-full text-left px-4 py-1.5 hover:bg-zinc-700 text-zinc-300"
            onClick={() => { refreshDb(contextMenu.db); setContextMenu(null); }}
          >
            Refresh
          </button>
        </div>
      )}

      {newColDb && (
        <div className="px-3 py-2 border-t border-zinc-700">
          <div className="text-xs text-zinc-400 mb-1">New collection in {newColDb}</div>
          <div className="flex gap-1">
            <input
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
              className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-600 rounded text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
              placeholder="Collection name"
              autoFocus
            />
            <button onClick={handleCreateCollection} className="px-2 py-1 bg-emerald-600 rounded text-xs text-white">
              Create
            </button>
            <button onClick={() => { setNewColDb(null); setNewColName(''); }} className="px-2 py-1 text-xs text-zinc-400">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
