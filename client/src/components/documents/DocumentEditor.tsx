import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import JsonEditor from '../common/JsonEditor';

interface DocumentEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (doc: any) => Promise<void>;
  document?: any;
  mode: 'create' | 'edit';
}

export default function DocumentEditor({ open, onClose, onSave, document, mode }: DocumentEditorProps) {
  const [value, setValue] = useState('{\n  \n}');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && document) {
      setValue(JSON.stringify(document, null, 2));
    } else if (open) {
      setValue('{\n  \n}');
    }
    setError(null);
  }, [open, document]);

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(value);
      setSaving(true);
      setError(null);
      await onSave(parsed);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={mode === 'create' ? 'Insert Document' : 'Edit Document'} width="max-w-2xl">
      <JsonEditor value={value} onChange={setValue} height="400px" />
      {error && <div className="mt-2 text-xs text-red-400 bg-red-950/50 rounded px-3 py-2">{error}</div>}
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-1.5 text-xs text-zinc-400 hover:text-zinc-200">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded text-xs font-medium text-white"
        >
          {saving ? 'Saving...' : mode === 'create' ? 'Insert' : 'Update'}
        </button>
      </div>
    </Modal>
  );
}
