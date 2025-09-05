import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { extractCodeBlocks } from '@/utils/codeBlockParser';
import { Check, X } from 'lucide-react';

interface MessageContentProps {
  content: string;
  onCodeConfirmation?: (code: string) => Promise<boolean>;
}

export const MessageContent: React.FC<MessageContentProps> = ({
  content,
  onCodeConfirmation
}) => {
  const { blocks, remainingText } = extractCodeBlocks(content);
  const [confirmedBlocks, setConfirmedBlocks] = useState<Set<number>>(new Set());
  const [rejectedBlocks, setRejectedBlocks] = useState<Set<number>>(new Set());

  const handleConfirm = async (code: string, index: number) => {
    if (onCodeConfirmation) {
      const confirmed = await onCodeConfirmation(code);
      if (confirmed) {
        setConfirmedBlocks(prev => new Set([...prev, index]));
      }
    }
  };

  const handleReject = (index: number) => {
    setRejectedBlocks(prev => new Set([...prev, index]));
  };

  return (
    <div className="space-y-4">
      {remainingText && (
        <div className="text-white whitespace-pre-wrap">{remainingText}</div>
      )}
      {blocks.map((block, index) => (
        <div key={index} className="relative">
          <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <code className={`language-${block.language}`}>
              {block.code}
            </code>
          </pre>
          {onCodeConfirmation && !confirmedBlocks.has(index) && !rejectedBlocks.has(index) && (
            <div className="absolute bottom-2 right-2 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleConfirm(block.code, index)}
              >
                <Check className="h-4 w-4 mr-1" />
                Add to Editor
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => handleReject(index)}
              >
                <X className="h-4 w-4 mr-1" />
                Dismiss
              </Button>
            </div>
          )}
          {confirmedBlocks.has(index) && (
            <div className="absolute bottom-2 right-2 text-green-500 text-sm">
              Added to editor ✓
            </div>
          )}
          {rejectedBlocks.has(index) && (
            <div className="absolute bottom-2 right-2 text-red-500 text-sm">
              Dismissed ×
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageContent;
