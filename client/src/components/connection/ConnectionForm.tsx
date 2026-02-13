import React, { useState } from 'react';
import { useConnectionStore } from '../../store/connectionStore';

export default function ConnectionForm() {
  const { connect, loading, error, savedConnections, removeSavedConnection } = useConnectionStore();
  const [uri, setUri] = useState('mongodb://localhost:27017');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('27017');
  const [authDb, setAuthDb] = useState('admin');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [tls, setTls] = useState(false);

  const buildUri = () => {
    if (!showAdvanced) return uri;
    let built = 'mongodb://';
    if (user && pass) built += `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@`;
    built += `${host}:${port}/${authDb}`;
    if (tls) built += '?tls=true';
    return built;
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await connect(buildUri());
    } catch {}
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 bg-zinc-900 border border-zinc-700 rounded-lg">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-100">MongoDB Viewer</h1>
          <p className="text-sm text-zinc-400 mt-1">Connect to your MongoDB instance</p>
        </div>

        <form onSubmit={handleConnect} className="space-y-4">
          {!showAdvanced ? (
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Connection String</label>
              <input
                type="text"
                value={uri}
                onChange={(e) => setUri(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                placeholder="mongodb://localhost:27017"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Host</label>
                  <input value={host} onChange={(e) => setHost(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-sm text-zinc-100 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Port</label>
                  <input value={port} onChange={(e) => setPort(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-sm text-zinc-100 focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Auth Database</label>
                <input value={authDb} onChange={(e) => setAuthDb(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-sm text-zinc-100 focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Username</label>
                  <input value={user} onChange={(e) => setUser(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-sm text-zinc-100 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Password</label>
                  <input type="password" value={pass} onChange={(e) => setPass(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-sm text-zinc-100 focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input type="checkbox" checked={tls} onChange={(e) => setTls(e.target.checked)}
                  className="rounded bg-zinc-800 border-zinc-600" />
                Enable TLS/SSL
              </label>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-emerald-400 hover:text-emerald-300"
          >
            {showAdvanced ? 'Use connection string' : 'Advanced options'}
          </button>

          {error && <div className="text-xs text-red-400 bg-red-950/50 rounded px-3 py-2">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded text-sm font-medium text-white transition-colors"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </form>

        {savedConnections.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs font-medium text-zinc-400 mb-2">Recent Connections</h3>
            <div className="space-y-1">
              {savedConnections.map((s) => (
                <div key={s} className="flex items-center justify-between group">
                  <button
                    onClick={() => { setUri(s); setShowAdvanced(false); }}
                    className="text-xs text-zinc-300 hover:text-emerald-400 truncate flex-1 text-left py-1"
                  >
                    {s}
                  </button>
                  <button
                    onClick={() => removeSavedConnection(s)}
                    className="text-zinc-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 ml-2"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
