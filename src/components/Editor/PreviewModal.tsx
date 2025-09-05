import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

interface PreviewModalProps {
  original: string;
  suggestion: string;
  onConfirm: () => void;
  onCancel: () => void;
  visible: boolean;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  original,
  suggestion,
  onConfirm,
  onCancel,
  visible,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-100 p-6 rounded-lg w-[80vw] max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">Preview Changes</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2 text-orange-500">Original</h3>
            <ScrollArea className="h-[60vh]">
              <pre className="whitespace-pre-wrap text-sm">{original}</pre>
            </ScrollArea>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2 text-orange-500">AI Suggestion</h3>
            <ScrollArea className="h-[60vh]">
              <pre className="whitespace-pre-wrap text-sm">{suggestion}</pre>
            </ScrollArea>
          </Card>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onCancel}>
            ❌ Cancel
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600" onClick={onConfirm}>
            ✅ Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
