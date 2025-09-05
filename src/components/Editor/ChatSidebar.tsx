import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import MessageBubble from '@/components/MessageBubble';
import { useToast } from '@/components/ui/use-toast';
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
  editorContent?: string;
  onEditorChange?: (newContent: string) => void;
  onCodeConfirmation?: (code: string) => Promise<boolean>;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onEditorChange,
}) => {
  const { toast } = useToast();
  const [inputMessage, setInputMessage] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Scroll only the message container instead of the whole page
    if (messagesEndRef.current) {
      const scrollContainer = messagesEndRef.current.closest('.scroll-view');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputMessage.trim() || isLoading) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-screen bg-dark-100 border-l border-dark-50">
      {/* Fixed Header */}
      <div className="flex-none p-4 border-b border-dark-50">
        <h2 className="text-lg font-semibold">AI Chat Assistant</h2>
      </div>

      {/* Scrollable Message Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-4 py-4 px-4 max-w-full">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                personas={personas}
                onCodeConfirmation={async (code) => {
                  const confirmed = window.confirm('Do you want to add this code to the editor?');
                  if (confirmed && onEditorChange) {
                    onEditorChange(code);
                    toast({
                      title: "Code Added",
                      description: "The code has been added to the editor",
                    });
                  }
                  return confirmed;
                }}
              />
            ))}
            {isLoading && (
              <div className="animate-pulse flex space-x-2 items-center">
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              </div>
            )}
            <div ref={messagesEndRef} className="scroll-marker" />
          </div>
        </ScrollArea>
      </div>

      {/* Fixed Input Area */}
      <div className="flex-none p-4 border-t border-dark-50">
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
