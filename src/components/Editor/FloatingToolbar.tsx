import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, TableProperties, ArrowLeftRight, AlignJustify } from 'lucide-react';

interface FloatingToolbarProps {
  position: { x: number; y: number } | null;
  onAction: (action: string) => void;
  visible: boolean;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  position,
  onAction,
  visible,
}) => {
  if (!visible || !position) return null;

  return (
    <div
      className="fixed z-50 bg-dark-100 border border-dark-50 rounded-lg shadow-lg p-2 flex gap-2"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'translateY(-100%)',
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 hover:bg-orange-500/20"
        onClick={() => onAction('edit')}
      >
        <Wand2 className="w-4 h-4" />
        Edit with AI
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 hover:bg-orange-500/20"
        onClick={() => onAction('table')}
      >
        <TableProperties className="w-4 h-4" />
        Convert to Table
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 hover:bg-orange-500/20"
        onClick={() => onAction('shorten')}
      >
        <ArrowLeftRight className="w-4 h-4" />
        Shorten
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 hover:bg-orange-500/20"
        onClick={() => onAction('length')}
      >
        <AlignJustify className="w-4 h-4" />
        Length
      </Button>
    </div>
  );
};

export default FloatingToolbar;
