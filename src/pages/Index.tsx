import React, { useState, useEffect, useRef } from "react";
import { personas, type Persona } from "@/data/personas";
import { generateAIResponse } from "@/utils/aiService";
import type { AIOperation } from "@/utils/aiService";
import TextEditor from "@/components/Editor/TextEditor";
import FloatingToolbar from "@/components/Editor/FloatingToolbar";
import PreviewModal from "@/components/Editor/PreviewModal";
import ChatSidebar from "@/components/Editor/ChatSidebar";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
}

interface EditorSelection {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [currentSelection, setCurrentSelection] = useState<EditorSelection | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [activePersona] = useState<Persona>(personas[0]); // Using Tauqueer's persona by default
  const editorRef = useRef<any>(null);

  useEffect(() => {
    // Send welcome message when component mounts
    handleStartChat();
  }, []);

  const addMessage = (content: string, sender: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content,
        sender,
        timestamp: new Date(),
      },
    ]);
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleTextSelect = (text: string, selection: EditorSelection) => {
    if (text) {
      const position = editorRef.current?.getScrolledVisiblePosition({
        lineNumber: selection.startLine,
        column: selection.startColumn
      });

      if (position) {
        const editorElement = editorRef.current?.getContainerDomNode();
        const rect = editorElement.getBoundingClientRect();
        setToolbarPosition({ 
          x: rect.left + position.left, 
          y: rect.top + position.top - 40 // offset to show above the selection
        });
        setSelectedText(text);
        setCurrentSelection(selection);
      }
    } else {
      setToolbarPosition(null);
      setCurrentSelection(null);
    }
  };

  const handleToolbarAction = async (action: string) => {
    setIsLoading(true);
    let operation: AIOperation = 'edit';
    
    switch (action) {
      case 'edit':
        operation = 'edit';
        break;
      case 'table':
        operation = 'table';
        break;
      case 'shorten':
        operation = 'shorten';
        break;
      case 'length':
        operation = 'lengthen';
        break;
    }

    try {
      const response = await generateAIResponse({
        text: selectedText,
        operation: operation,
        temperature: 0.7
      });
      setAiSuggestion(response);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async () => {
    setIsLoading(true);

    try {
      const response = await generateAIResponse({
        text: "Say hello and introduce yourself briefly",
        operation: 'chat',
        temperature: 0.7
      });
      addMessage(response, activePersona.id);
    } catch (error) {
      console.error("Error getting welcome message:", error);
      addMessage(
        `Hello! I'm Tauqueer, your AI programming assistant. I can help you with:
- Writing code in various languages (C++, Python, Java, etc.)
- Explaining programming concepts
- Debugging and improving code
- Answering programming questions

Feel free to ask me anything! For example:
- "Write a C++ function to add two numbers"
- "Help me understand arrays in Python"
- "Debug this Java code"`,
        activePersona.id
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    addMessage(message, "user");
    setIsLoading(true);

    try {
      // Check if message is code-related
      const isCodeCommand = /^(write|check|modify|fix|review|add|update|implement|create|show|edit) code/i.test(message);
      
      let response;
      // Check for any programming-related keywords, not just commands
      const isProgrammingQuery = /(c\+\+|python|java|javascript|function|program|code|algorithm)/i.test(message);
      
      if (isCodeCommand || isProgrammingQuery) {
        // Get current editor content for context
        const currentCode = editorRef.current?.getValue() || '';
        
        response = await generateAIResponse({
          text: message,
          operation: 'chat', // Changed to 'chat' to handle code generation better
          temperature: 0.7
        });

        // If response contains code blocks, extract and update editor
        const codeMatch = response.match(/```(?:\w+)?\n([\s\S]*?)```/);
        if (codeMatch && codeMatch[1]) {
          // Update editor content
          editorRef.current?.setValue(codeMatch[1].trim());
          response = "I've updated the code editor with the requested changes. " + 
                    response.replace(/```(?:\w+)?\n[\s\S]*?```/, '').trim();
        }
      } else {
        response = await generateAIResponse({
          text: message,
          operation: 'chat',
          temperature: 0.7
        });
      }
      
      addMessage(response, activePersona.id);
    } catch (error) {
      console.error("Error generating response:", error);
      addMessage("Sorry, I couldn't process that message.", activePersona.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-dark-500">
      {/* Main Editor Section */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-dark-50">
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              AI Code Editor
            </span>
          </h1>
        </div>
        
        <div className="flex-1 relative">
          <TextEditor 
            onTextSelect={handleTextSelect}
            onEditorMount={handleEditorDidMount}
          />
          
          <FloatingToolbar
            position={toolbarPosition}
            onAction={handleToolbarAction}
            visible={!!toolbarPosition}
          />
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-[400px]">
        <ChatSidebar
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Preview Modal */}
      <PreviewModal
        visible={showPreview}
        original={selectedText}
        suggestion={aiSuggestion}
        onConfirm={() => {
          if (editorRef.current && currentSelection) {
            const model = editorRef.current.getModel();
            editorRef.current.executeEdits('ai-suggestion', [{
              range: {
                startLineNumber: currentSelection.startLine,
                startColumn: currentSelection.startColumn,
                endLineNumber: currentSelection.endLine,
                endColumn: currentSelection.endColumn
              },
              text: aiSuggestion
            }]);
          }
          setShowPreview(false);
          setToolbarPosition(null);
        }}
        onCancel={() => {
          setShowPreview(false);
          setToolbarPosition(null);
        }}
      />
    </div>
  );
};

export default Index;