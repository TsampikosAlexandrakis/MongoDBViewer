const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Connection
  connect: (uri: string) => request('/connect', { method: 'POST', body: JSON.stringify({ uri }) }),
  disconnect: () => request('/disconnect', { method: 'DELETE' }),
  status: () => request<{ connected: boolean; uri: string | null }>('/status'),

  // Databases
  listDatabases: () => request<Array<{ name: string; sizeOnDisk: number }>>('/databases'),
  dbStats: (db: string) => request(`/databases/${encodeURIComponent(db)}/stats`),

  // Collections
  listCollections: (db: string) =>
    request<Array<{ name: string; count: number }>>(`/databases/${encodeURIComponent(db)}/collections`),
  createCollection: (db: string, name: string) =>
    request(`/databases/${encodeURIComponent(db)}/collections`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  dropCollection: (db: string, col: string) =>
    request(`/databases/${encodeURIComponent(db)}/collections/${encodeURIComponent(col)}`, {
      method: 'DELETE',
    }),

  // Documents
  listDocuments: (db: string, col: string, params: {
    filter?: string; sort?: string; projection?: string; page?: number; limit?: number;
  } = {}) => {
    const qs = new URLSearchParams();
    if (params.filter) qs.set('filter', params.filter);
    if (params.sort) qs.set('sort', params.sort);
    if (params.projection) qs.set('projection', params.projection);
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    return request<{ documents: any[]; total: number; page: number; limit: number; totalPages: number }>(
      `/databases/${encodeURIComponent(db)}/collections/${encodeURIComponent(col)}/documents?${qs}`
    );
  },
  insertDocument: (db: string, col: string, doc: any) =>
    request(`/databases/${encodeURIComponent(db)}/collections/${encodeURIComponent(col)}/documents`, {
      method: 'POST',
      body: JSON.stringify(doc),
    }),
  updateDocument: (db: string, col: string, id: string, doc: any) =>
    request(`/databases/${encodeURIComponent(db)}/collections/${encodeURIComponent(col)}/documents/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(doc),
    }),
  deleteDocument: (db: string, col: string, id: string) =>
    request(`/databases/${encodeURIComponent(db)}/collections/${encodeURIComponent(col)}/documents/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // Indexes
  listIndexes: (db: string, col: string) =>
    request<any[]>(`/databases/${encodeURIComponent(db)}/collections/${encodeURIComponent(col)}/indexes`),
  createIndex: (db: string, col: string, keys: any, options?: any) =>
    request(`/databases/${encodeURIComponent(db)}/collections/${encodeURIComponent(col)}/indexes`, {
      method: 'POST',
      body: JSON.stringify({ keys, options }),
    }),
  dropIndex: (db: string, col: string, name: string) =>
    request(`/databases/${encodeURIComponent(db)}/collections/${encodeURIComponent(col)}/indexes/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    }),

  // Aggregation
  aggregate: (db: string, col: string, pipeline: any[]) =>
    request<{ results: any[]; count: number }>(
      `/databases/${encodeURIComponent(db)}/collections/${encodeURIComponent(col)}/aggregate`,
      { method: 'POST', body: JSON.stringify({ pipeline }) }
    ),

  // Schema
  getSchema: (db: string, col: string, sample?: number) => {
    const qs = sample ? `?sample=${sample}` : '';
    return request<{
      fields: Array<{
        path: string;
        types: Array<{ type: string; count: number; percentage: number }>;
        probability: number;
      }>;
      sampleSize: number;
    }>(`/databases/${encodeURIComponent(db)}/collections/${encodeURIComponent(col)}/schema${qs}`);
  },
};
