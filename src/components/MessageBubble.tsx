import React, { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { type Persona } from "@/data/personas";
import { extractCodeBlocks } from "@/utils/codeBlockParser";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

interface MessageProps {
  message: {
    id: string;
    content: string;
    sender: string;
    timestamp: Date;
  };
  personas: Persona[];
  onCodeConfirmation?: (code: string) => Promise<boolean>;
}

const MessageBubble: React.FC<MessageProps> = ({ message, personas }) => {
  const isUserMessage = message.sender === "user";
  const isSystemMessage = message.sender === "system";
  const isGroupMessage = message.sender === "group";

  const persona =
    isUserMessage || isSystemMessage || isGroupMessage
      ? null
      : personas.find((p) => p.id === message.sender);

  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4 animate-entry">
        <div className="bg-dark-100/50 text-muted-foreground text-sm px-4 py-2 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  if (isUserMessage) {
    return (
      <div className="flex flex-col items-end mb-4 animate-entry">
        <div className="user-message max-w-[85%]">
          <p className="text-white whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1 mr-2">
          {format(message.timestamp, "h:mm a")}
        </span>
      </div>
    );
  }

  if (isGroupMessage) {
    return (
      <div className="flex gap-3 mb-4 animate-entry">
        <Avatar className="h-8 w-8 mt-1">
          <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-orange-400 to-orange-600 text-white text-xs font-bold">
            G
          </div>
        </Avatar>
        <div className="flex flex-col">
          <div className="ai-message">
            <MessageContent 
              content={message.content} 
              onCodeConfirmation={onCodeConfirmation}
            />
          </div>
          <span className="text-xs text-muted-foreground mt-1 ml-2">
            Group • {format(message.timestamp, "h:mm a")}
          </span>
        </div>
      </div>
    );
  }

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState('');

  const handleCodeBlock = (code: string) => {
    setCurrentCode(code);
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (onCodeConfirmation) {
      await onCodeConfirmation(currentCode);
    }
    setDialogOpen(false);
  };

  // Helper function to format the message content
  const formatMessageContent = (content: string) => {
    // First check if it's a confirmation message from the AI
    if (content.includes("Would you like me to show you the code solution?")) {
      return content.split(/\n/).map((line, index) => (
        <div key={`text-${index}`} className="my-1">{line}</div>
      ));
    }

    const codeBlockRegex = /```([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textContent = content.slice(lastIndex, match.index);
        parts.push(...formatTextContent(textContent));
      }

      // Add code block
      const code = match[1].trim();
      parts.push(
        <div key={`code-${match.index}`} className="relative">
          <pre className="bg-muted p-4 rounded-lg my-2 overflow-x-auto">
            <code>{code}</code>
          </pre>
          <button
            onClick={() => handleCodeBlock(code)}
            className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs hover:bg-primary/90"
          >
            Add to Panel
          </button>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      const textContent = content.slice(lastIndex);
      parts.push(...formatTextContent(textContent));
    }

    return parts;
  };

  // Helper function to format text content
  const formatTextContent = (content: string) => {
    // Check if it's a question or confirmation message
    if (content.includes("Would you like me to show you the code solution?") ||
        content.includes("Would you like me to add this code to the coding panel?")) {
      return content.split(/\n/).map((line, index) => 
        <div key={`text-${index}`} className="my-1">{line}</div>
      );
    }

    return content.split(/\n|•/).map((line, index) => {
      line = line.trim();
      if (!line) return null;
      
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={`text-${index}`} className="ml-4 my-1">
            • {line.substring(2)}
          </div>
        );
      }
      return <div key={`text-${index}`} className="my-1">{line}</div>;
    }).filter(Boolean);
  };

  return (
    <div className="flex gap-3 mb-4 animate-entry max-w-full">
      <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
        <img src={persona?.avatar} alt={persona?.name} />
      </Avatar>
      <div className="flex flex-col flex-grow min-w-0">
        <div className="ai-message">
          <div className="text-white whitespace-pre-wrap break-words">
            {formatMessageContent(message.content)}
          </div>
        </div>
        <span className="text-xs text-muted-foreground mt-1 ml-2">
          {persona?.name} • {format(message.timestamp, "h:mm a")}
        </span>
        
        <AlertDialog open={dialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add Code to Panel?</AlertDialogTitle>
              <AlertDialogDescription>
                Would you like to add this code to the coding panel?
                <pre className="mt-4 p-4 bg-muted rounded-lg overflow-auto max-h-[200px]">
                  <code>{currentCode}</code>
                </pre>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDialogOpen(false)}>
                No, Thanks
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>
                Yes, Add Code
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default MessageBubble;
