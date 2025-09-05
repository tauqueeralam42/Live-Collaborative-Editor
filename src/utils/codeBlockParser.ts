export interface CodeBlock {
  language: string;
  code: string;
}

export function extractCodeBlocks(text: string): { blocks: CodeBlock[], remainingText: string } {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: CodeBlock[] = [];
  let remainingText = text;
  
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2].trim()
    });
    
    // Remove the code block from remaining text
    remainingText = remainingText.replace(match[0], '');
  }
  
  return {
    blocks,
    remainingText: remainingText.trim()
  };
}
