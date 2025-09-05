import { GoogleGenAI } from "@google/genai";

// Initialize the API
const API_KEY = import.meta.env.VITE_GEMINI_API;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API environment variable is not set");
}

// Initialize Gemini AI with the new API format
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Types and Interfaces
interface ChatMessage {
  speaker: string;
  text: string;
}

interface AIRequest {
  text: string;
  operation: AIOperation;
  temperature?: number;
  threadId?: string;
}

export type AIOperation = 'chat' | 'edit' | 'shorten' | 'lengthen' | 'table';

// Pattern matching for code detection
const codePatterns = {
  languages: /\b(c\+\+|python|java|javascript|typescript|c#|ruby|php|go|rust|swift)\b/i,
  actions: /\b(write|create|implement|code|program|function|class|method|solve|generate|give|show|help|add|make|develop)\b/i,
  concepts: /\b(algorithm|function|program|code|solution|example|implementation|way|approach)\b/i,
  questions: /\b(how|what|can|could|would|will|please|need)\b/i
};

// Chat history management
const chatHistories: Record<string, ChatMessage[]> = {};

// Helper functions
const isCodeQuery = (text: string): boolean => {
  const matches = Object.values(codePatterns).map(pattern => pattern.test(text));
  return matches.filter(Boolean).length >= 2 || codePatterns.languages.test(text);
};

const extractLanguage = (text: string): string => {
  const languageMatch = text.match(codePatterns.languages);
  if (languageMatch) {
    const lang = languageMatch[1].toLowerCase();
    return lang === 'c++' ? 'cpp' : lang;
  }
  return '';
};

function createContext(chatHistory: ChatMessage[] = []) {
  let context = `
  ROLE AND IDENTITY:
  You are an AI programming assistant named Tauqueer. You are an expert in multiple programming languages including Python, Java, C++, JavaScript, TypeScript, and others.
  
  CORE INSTRUCTIONS:
  1. When asked for code, ALWAYS respond with complete, working code examples
  2. ALWAYS wrap code examples in appropriate \`\`\` code blocks with the language specified
  3. For programming questions, provide:
     - A brief explanation of the solution
     - The complete code example with comments
     - Brief explanation of how to use the code
  4. Use proper formatting and indentation in code
  5. Include helpful comments in the code
  
  CAPABILITIES:
  - Multi-language programming expertise
  - Code explanations and best practices
  - Algorithm implementation and optimization
  - Debugging help and error explanations
  - Code refactoring suggestions
  - Technical documentation

  RESPONSE FORMAT:
  For code requests:
  1. Brief introduction
  2. Code block with language specification
  3. Usage explanation
  4. Additional notes (if needed)
  `;

  if (chatHistory.length > 0) {
    context += `\n\nCHAT HISTORY:\n`;
    chatHistory.forEach((msg) => {
      context += `${msg.speaker}: ${msg.text}\n`;
    });
  }

  return context.trim();
}

function createPromptInstruction(operation: AIOperation, text: string, language?: string) {
  switch (operation) {
    case 'chat':
      return `
        TASK: Respond to the user's message: "${text}"
        GUIDELINES:
        - Always provide complete, working code examples when asked
        - Use markdown code blocks with language specification
        - Include comments in code
        - Explain the solution briefly
        - Format code properly
        - For programming questions, always follow this structure:
          1. Brief explanation
          2. Complete code example in code block
          3. Additional explanation if needed`;

    case 'edit':
      return `
        TASK: Improve the following text while maintaining its meaning:
        "${text}"
        GUIDELINES:
        - Fix any grammar or style issues
        - Improve clarity and readability
        - Maintain the original meaning
        - For code: improve formatting and follow best practices`;

    default:
      return `
        TASK: Process the following text according to operation '${operation}':
        "${text}"
        GUIDELINES:
        - Keep the response clear and concise
        - Maintain original meaning
        - Use appropriate formatting`;
  }
}

export async function generateAIResponse({
  text,
  operation,
  temperature = 0.7,
  threadId = 'default-thread'
}: AIRequest): Promise<string> {
  try {
    console.log('Generating AI response for:', { text, operation, threadId });

    if (!chatHistories[threadId]) {
      chatHistories[threadId] = [];
    }

    let formattedText = text;
    const language = extractLanguage(text);

    if (isCodeQuery(text)) {
      // Check if this is a response to a code confirmation
      const isConfirmation = /^(yes|y|sure|okay|ok|yep|yeah)/i.test(text.trim());
      const previousMessage = chatHistories[threadId]?.slice(-1)[0]?.text;
      const wasAskingAboutCodePanel = previousMessage?.includes("Would you like me to add this code to the coding panel?");
      const wasAskingForSolution = previousMessage?.includes("Would you like me to show you the code solution?");

      if (wasAskingAboutCodePanel) {
        if (isConfirmation) {
          formattedText = `Adding the code to the coding panel:

[CODE_PANEL_START]
${chatHistories[threadId].slice(-2)[0].text.match(/```[\s\S]*?```/)?.[0] || ''}
[CODE_PANEL_END]

Let me know if you need any modifications or have questions about the code!`;
        } else {
          formattedText = `No problem! The code is still available in our chat if you need it later. Let me know if you have any questions about the solution.`;
        }
      } else if (wasAskingForSolution) {
        if (isConfirmation) {
          formattedText = `
Here's the solution:

CODING TASK ANALYSIS:
Previous Query: "${chatHistories[threadId].slice(-2)[0].text}"
Detected Language: ${language || 'Not specified, please infer from context'}

RESPONSE REQUIREMENTS:
1. Provide a complete, working solution
2. Include detailed comments explaining the code
3. Use proper code formatting and style
4. Add brief explanation of the approach
5. If the language isn't specified, provide the solution in the most appropriate language for the task

FORMAT YOUR RESPONSE AS FOLLOWS:
1. Brief introduction explaining what the code does
2. Complete code example in a proper markdown code block with language specified
3. Brief explanation of how to use the code
4. Any additional notes or best practices
`;
        } else {
          formattedText = `Since you don't want to see the code solution, I'll provide a high-level explanation of how to solve "${chatHistories[threadId].slice(-2)[0].text}" without showing any code.`;
        }
      } else {
        formattedText = `
I can help you with that! But before I show you any code, let me ask:

Would you like me to show you the code solution? (yes/no)

This way, I can either provide you with the complete code solution or explain the approach without code, based on your preference.`;
      }
    }

    chatHistories[threadId].push({ speaker: "User", text: formattedText });

    const context = createContext(chatHistories[threadId]);
    const instruction = createPromptInstruction(operation, text, language);
    const prompt = context + instruction;

    // Generate the content
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: context + "\n\n" + formattedText,
    });

    let reply = response.text || '';

    // Validation and retry for code queries
    if (isCodeQuery(text) && !reply.includes("```")) {
      const retryResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: context + "\n\n" + formattedText + "\n\nIMPORTANT: Your response MUST include code wrapped in triple backticks with language specification."
      });

      reply = retryResponse.text || reply;
    }

    // If the response contains code and we haven't asked about the code panel yet
    if (reply.includes("```") && !reply.includes("[CODE_PANEL_") && 
        !reply.includes("Would you like me to add this code") &&
        !reply.includes("Would you like me to show you the code solution?")) {
      // Store the code response
      const codeResponse = reply;
      // Ask about adding to code panel
      reply = `Here's the solution I came up with:

${codeResponse}

Would you like me to add this code to the coding panel? (yes/no)`;
    }

    chatHistories[threadId].push({ speaker: "Assistant", text: reply });
    return reply;

  } catch (error) {
    console.error("Error generating AI response:", error);
    return `I encountered an error while processing your request.

Here's what you can try:
1. Make sure you're asking for a specific programming task
2. Try rephrasing your request to be more specific
3. Include the programming language you want to use

For example:
• "Write a C++ function that adds two integers"
• "Show me a C++ program to add two numbers"
• "Create a function in C++ for adding numbers"

${error.message ? `\nTechnical details: ${error.message}` : ''}`;
  }
}
