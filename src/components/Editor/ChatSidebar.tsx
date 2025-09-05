import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import MessageBubble from '@/components/MessageBubble';
import { personas } from '@/data/personas';

interface ChatSidebarProps {
  messages: {
    id: string;
    content: string;
    sender: string;
    timestamp: Date;
  }[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  messages,
  onSendMessage,
  isLoading,
}) => {
  const [inputMessage, setInputMessage] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputMessage.trim() || isLoading) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-dark-100 border-l border-dark-50">
      <div className="p-4 border-b border-dark-50">
        <h2 className="text-lg font-semibold">AI Chat Assistant</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              personas={personas}
            />
          ))}
          {isLoading && (
            <div className="animate-pulse flex space-x-2 items-center">
              <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-dark-50">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="bg-dark-100 border-dark-50"
          />
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={handleSend}
            disabled={isLoading || !inputMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
