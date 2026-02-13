import React, { useState } from 'react';

interface TreeNode {
  key: string;
  value: any;
}

function JsonTreeNode({ nodeKey, value, depth }: { nodeKey: string; value: any; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 2);

  if (value === null) {
    return (
      <div className="flex gap-1" style={{ paddingLeft: depth * 16 }}>
        <span className="text-zinc-400">{nodeKey}:</span>
        <span className="text-orange-400">null</span>
      </div>
    );
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value);
    return (
      <div style={{ paddingLeft: depth * 16 }}>
        <button
          className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="text-[10px]">{expanded ? '▼' : '▶'}</span>
          <span>{nodeKey}:</span>
          {!expanded && <span className="text-zinc-500">{`{${entries.length}}`}</span>}
        </button>
        {expanded && entries.map(([k, v]) => (
          <JsonTreeNode key={k} nodeKey={k} value={v} depth={depth + 1} />
        ))}
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div style={{ paddingLeft: depth * 16 }}>
        <button
          className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="text-[10px]">{expanded ? '▼' : '▶'}</span>
          <span>{nodeKey}:</span>
          {!expanded && <span className="text-zinc-500">{`[${value.length}]`}</span>}
        </button>
        {expanded && value.map((item, i) => (
          <JsonTreeNode key={i} nodeKey={String(i)} value={item} depth={depth + 1} />
        ))}
      </div>
    );
  }

  const colorClass =
    typeof value === 'string' ? 'text-green-400' :
    typeof value === 'number' ? 'text-blue-400' :
    typeof value === 'boolean' ? 'text-yellow-400' :
    'text-zinc-300';

  return (
    <div className="flex gap-1" style={{ paddingLeft: depth * 16 }}>
      <span className="text-zinc-400">{nodeKey}:</span>
      <span className={colorClass}>
        {typeof value === 'string' ? `"${value}"` : String(value)}
      </span>
    </div>
  );
}

export default function TreeView({ data }: { data: any }) {
  if (!data || typeof data !== 'object') return <span className="text-zinc-400">{String(data)}</span>;

  return (
    <div className="font-mono text-xs leading-relaxed">
      {Object.entries(data).map(([key, value]) => (
        <JsonTreeNode key={key} nodeKey={key} value={value} depth={0} />
      ))}
    </div>
  );
}
