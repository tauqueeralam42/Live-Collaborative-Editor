import React, { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { type Persona } from "@/data/personas";
import { extractCodeBlocks } from "@/utils/codeBlockParser";

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

  // Helper function to format the message content
  const formatMessageContent = (content: string) => {
    // Split content by newlines and bullet points
    return content.split(/\n|•/).map((line, index) => {
      line = line.trim();
      if (!line) return null;
      
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={index} className="ml-4 my-1">
            • {line.substring(2)}
          </div>
        );
      }
      return <div key={index} className="my-1">{line}</div>;
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
      </div>
    </div>
  );
};

export default MessageBubble;
