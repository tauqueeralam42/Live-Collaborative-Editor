import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';

interface TextEditorProps {
  onTextSelect: (selectedText: string, selection: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  }) => void;
  onEditorMount?: (editor: any) => void;
  initialValue?: string;
  onChange?: (value: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ 
  onTextSelect, 
  onEditorMount, 
  initialValue = '// Type your code here...',
  onChange 
}) => {
  const editorRef = useRef(null);
  const [value, setValue] = useState(initialValue);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    if (onEditorMount) {
      onEditorMount(editor);
    }
    
    editor.onDidChangeModelContent(() => {
      const newValue = editor.getValue();
      setValue(newValue);
      onChange?.(newValue);
    });

    editor.onDidChangeCursorSelection((e: any) => {
      const selection = editor.getModel().getValueInRange(e.selection);
      if (selection && selection.trim().length > 0) {
        onTextSelect(selection, {
          startLine: e.selection.startLineNumber,
          startColumn: e.selection.startColumn,
          endLine: e.selection.endLineNumber,
          endColumn: e.selection.endColumn
        });
      } else {
        onTextSelect('', {
          startLine: 0,
          startColumn: 0,
          endLine: 0,
          endColumn: 0
        });
      }
    });
  };

  return (
    <div className="w-full h-full">
      <Editor
        height="90vh"
        defaultLanguage="javascript"
        theme="vs-dark"
        value={value}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
};

export default TextEditor;
