import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/client';
import { useNavigationStore } from '../../store/navigationStore';
import FilterBar from './FilterBar';
import DocumentEditor from './DocumentEditor';
import TreeView from '../common/TreeView';

interface Props {
  db: string;
  collection: string;
}

type ViewMode = 'table' | 'json';

export default function DocumentList({ db, collection }: Props) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('');
  const [projection, setProjection] = useState('');
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');

  const fetchDocuments = useCallback(async (p: number = page) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.listDocuments(db, collection, {
        filter: filter || undefined,
        sort: sort || undefined,
        projection: projection || undefined,
        page: p,
        limit,
      });
      setDocuments(result.documents);
      setTotal(result.total);
      setPage(result.page);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }, [db, collection, filter, sort, projection, limit, page]);

  useEffect(() => {
    setPage(1);
    fetchDocuments(1);
  }, [db, collection]);

  const handleApply = () => {
    setPage(1);
    fetchDocuments(1);
  };

  const handleInsert = async (doc: any) => {
    try {
      await api.insertDocument(db, collection, doc);
      fetchDocuments();
    } catch (err: any) {
      setError(err.message || 'Failed to insert document');
    }
  };

  const handleUpdate = async (doc: any) => {
    if (!editingDoc) return;
    try {
      const id = editingDoc._id?.$oid || editingDoc._id || String(editingDoc._id);
      await api.updateDocument(db, collection, String(id), doc);
      fetchDocuments();
    } catch (err: any) {
      setError(err.message || 'Failed to update document');
    }
  };

  const handleDelete = async (doc: any) => {
    if (!confirm('Delete this document?')) return;
    try {
      const id = doc._id?.$oid || doc._id || String(doc._id);
      await api.deleteDocument(db, collection, String(id));
      fetchDocuments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
    }
  };

  const handleDropCollection = async () => {
    if (!confirm(`Drop collection "${collection}"? This cannot be undone.`)) return;
    try {
      await api.dropCollection(db, collection);
      useNavigationStore.getState().setActiveCollection(db, null);
    } catch (err: any) {
      setError(err.message || 'Failed to drop collection');
    }
  };

  const allKeys = Array.from(new Set(documents.flatMap((d) => Object.keys(d))));

  const renderCellValue = (v: any) => {
    if (v === null || v === undefined) return <span className="text-zinc-600">null</span>;
    if (typeof v === 'object') return <span className="text-zinc-400 truncate">{JSON.stringify(v)}</span>;
    return <span className="truncate">{String(v)}</span>;
  };

  return (
    <div className="h-full flex flex-col">
      <FilterBar
        filter={filter} sort={sort} projection={projection} limit={limit}
        onFilterChange={setFilter} onSortChange={setSort} onProjectionChange={setProjection}
        onLimitChange={setLimit} onApply={handleApply}
      />

      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/50 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400">{total} documents</span>
          <div className="flex rounded overflow-hidden border border-zinc-700">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 py-0.5 text-[10px] ${viewMode === 'table' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800'}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-2 py-0.5 text-[10px] ${viewMode === 'json' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800'}`}
            >
              JSON
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDropCollection}
            className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-xs font-medium text-white"
          >
            Drop Collection
          </button>
          <button
            onClick={() => { setEditingDoc(null); setEditorMode('create'); setEditorOpen(true); }}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-medium text-white"
          >
            + Insert
          </button>
        </div>
      </div>

      {error && <div className="px-3 py-2 text-xs text-red-400 bg-red-950/50">{error}</div>}

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-zinc-500 text-sm">Loading...</div>
        ) : viewMode === 'table' ? (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-zinc-900 z-10">
              <tr>
                {allKeys.map((key) => (
                  <th key={key} className="text-left px-3 py-2 font-medium text-zinc-400 border-b border-zinc-700 whitespace-nowrap">
                    {key}
                  </th>
                ))}
                <th className="px-3 py-2 border-b border-zinc-700 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, i) => (
                <tr key={i} className="hover:bg-zinc-900/80 border-b border-zinc-800/50">
                  {allKeys.map((key) => (
                    <td key={key} className="px-3 py-2 text-zinc-300 max-w-[300px] truncate">
                      {renderCellValue(doc[key])}
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingDoc(doc); setEditorMode('edit'); setEditorOpen(true); }}
                        className="text-zinc-500 hover:text-emerald-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(doc)}
                        className="text-zinc-500 hover:text-red-400"
                      >
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="space-y-2 p-3">
            {documents.map((doc, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-700 rounded p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingDoc(doc); setEditorMode('edit'); setEditorOpen(true); }}
                      className="text-[10px] text-zinc-500 hover:text-emerald-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="text-[10px] text-zinc-500 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <TreeView data={doc} />
              </div>
            ))}
          </div>
        )}

        {documents.length === 0 && !loading && (
          <div className="flex items-center justify-center h-32 text-zinc-500 text-sm">No documents found</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-700 bg-zinc-900">
          <span className="text-xs text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => { setPage(page - 1); fetchDocuments(page - 1); }}
              disabled={page <= 1}
              className="px-2 py-1 text-xs rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-30"
            >
              Prev
            </button>
            <button
              onClick={() => { setPage(page + 1); fetchDocuments(page + 1); }}
              disabled={page >= totalPages}
              className="px-2 py-1 text-xs rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <DocumentEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={editorMode === 'create' ? handleInsert : handleUpdate}
        document={editingDoc}
        mode={editorMode}
      />
    </div>
  );
}
