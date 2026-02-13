import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';

interface JsonEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

export default function JsonEditor({ value, onChange, readOnly = false, height = '300px' }: JsonEditorProps) {
  return (
    <CodeMirror
      value={value}
      height={height}
      theme={oneDark}
      extensions={[json()]}
      readOnly={readOnly}
      onChange={onChange}
      className="border border-zinc-700 rounded text-sm"
    />
  );
}
