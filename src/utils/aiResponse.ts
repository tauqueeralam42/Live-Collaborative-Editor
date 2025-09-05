import { GoogleGenerativeAI } from "@google/generative-ai";
import { type Persona } from "@/data/personas";
import { personas } from "@/data/personas";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API);

type PersonalityTone = "default" | "funny" | "advice" | "educational";
const chatHistories: Record<
  string,
  { speaker: string; text: string }[]
> = {};


function createPersonaContext(
  persona: Persona, 
  otherPersonas: Persona[] = [],
  personalityTone: PersonalityTone = "default",
  chatHistory: { speaker: string; text: string }[] = []
) {
  let context =  `
  PERSONA IDENTITY:
  You are ${persona.name}, ${persona.title}. ${persona.bio}

  YOUR EXPERTISE:
  ${persona.specialties.join(", ")}

  YOUR SKILLS:
  - Frontend: ${persona.skills.frontend.join(", ")}
  - Backend: ${persona.skills.backend.join(", ")}
  - Programming Languages: ${persona.skills.languages.join(", ")}
  - Tools: ${persona.skills.tools.join(", ")}
  If ask skills tell some of them by mixing of frontend backend database tools

  EDUCATION:
  - College: ${persona.education.college.name} (${persona.education.college.degree}, ${persona.education.college.year})
  - Intermediate: ${persona.education.Intermediate.name}, ${persona.education.Intermediate.board} (${persona.education.Intermediate.year})
  - Matriculation: ${persona.education.Matriculation.name}, ${persona.education.Matriculation.board} (${persona.education.Matriculation.year})

  COMMUNICATION STYLE:
  - Voice: ${persona.style.voice}
  - Personality traits: ${persona.style.traits.join(", ")}
  - Example phrases you often use: ${persona.tunes.join(" | ")}
  - Reply message in good way 
  - Respond casually, like you're texting a friend. Be real, helpful, and fun.
  - Use your own vibe, but don't copy-paste catchphrases every time. You can include your tone, humor, or energy but **priority is replying to the user's question or comment**

  ACHIEVEMENTS:
  ${persona.achievements.join(" | ")}

  INTERESTS:
  ${persona.interests.join(", ")}

  LANGUAGES SPOKEN:
  ${persona.spokenLanguages.join(", ")}

  PORTFOLIO:
  ${persona.portfolio}

  SOCIAL LINKS:
  GitHub: ${persona.socialLinks.github} | LinkedIn: ${persona.socialLinks.linkedin} | LeetCode: ${persona.socialLinks.leetcode} | Email: ${persona.socialLinks.email}
  
  FRIENDS:
  - Tauqueer Arvind Divyanshu Adarsh Abhisheek Shiwani ye sbhi log friends hai
  - Ye log raat m arvind k room p chill krne k liye mila krte the. Bate krte the baat krte karte raat se subha ho jatai thi isliye ise Lotus effect bolte the
  - Arvind ko phad reviver nature pasnd h uska abhi tcs ninja m placement ho gya h isliye divyanshu usko ninja ninja bol kr chidha ta h
  - Divyanshu uttrakhand se wo nature k bich pala bdha h whi bara huwa h use nature psnd h wo ye sb rat race m nhi pdhna chata
  - Arvind divyanshu ko pdhadi pahadi bol kr chidha ta h
  - Arvind book pdha krta tha Sapiens 

  LOTUS EFFECT:
  - Arvind k room p raat m hm sbhi friends chai pine ka plane kiya krte the raat m jante the aur subha m wps room m aya krte the isliye use lotus effect khte the
  - Arvind k room p AC chalta h hm sbhi friends log uske room p rhte the...grmi m mst chill krte the arvind chai banaya krta tha hm logo m koi ek dudh le kr ata tha 
  - Sbhi log lotus effect se dara krte the kyu ki ek bar agr arvind k room p gye to direct subha ate the hm log abhi log ka discussion hota tha wah auske room p different different topics p
  - Arvind Sapiens book pdh akrta tha usi p hmesa discussion hota tha evalution p life p... inhi sb dicussion k wjhe se pura raat nikl jata tha
  `;

  if (personalityTone !== "default") {
    context += `\n\nSPECIAL TONE INSTRUCTIONS:`;
    
    switch (personalityTone) {
      case "funny":
        context += `
        - Be extra humorous and playful in your responses
        - Use more jokes, emojis, and light-hearted expressions
        - Don't take anything too seriously
        - Incorporate more of your funny catchphrases`;
        break;
      
      case "advice":
        context += `
        - Focus on giving practical, actionable advice
        - Be more mentorship-oriented and supportive
        - Share personal experiences that might help the user
        - Be encouraging but realistic with your guidance`;
        break;
      
      case "educational":
        context += `
        - Be more explanatory and detailed in your responses
        - Focus on teaching concepts clearly and thoroughly
        - Use examples to illustrate points when relevant
        - Be patient and pedagogical in your approach`;
        break;
    }
  }

  if (chatHistory.length > 0) {
    context += `\n\nCHAT HISTORY:\n`;
    chatHistory.forEach((chatItem) => {
      context += `${chatItem.speaker}: ${chatItem.text}\n`;
    });
  }

  return context.trim();
}

export async function generateAIResponse(
  message: string,
  activePersonas: Persona[],
  temperature: number = 0.8,
  personalityTone: PersonalityTone = "default",
  threadId: string = "default-thread"
) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 100,
        temperature: temperature,
      },
    });

    if (!chatHistories[threadId]) {
      // We start the thread with the user's message
      chatHistories[threadId] = [{ speaker: "User", text: message }];
    } else {
      // If the chat history already exists, you might choose to update it with the latest user input.
      chatHistories[threadId].push({ speaker: "User", text: message });
    }

    if (activePersonas.length === 1) {
      const persona = activePersonas[0];
      const otherTeachers = personas.filter((p) => p.id !== persona.id);
      const context = createPersonaContext(persona, otherTeachers, personalityTone,chatHistories[threadId]);
      const userInstruction = `
        TASK:
        Respond to this message: "${message}"
        RESPONSE GUIDELINES:
        - Respond in Hinglish style as ${persona.name}
        - Keep your response to 3-4 Lines
        - Stay true to your unique voice and personality`;
      const prompt = context + userInstruction;
      const result = await model.generateContent(prompt);
      const reply = result.response.text();

      // Add reply to the chat history.
      chatHistories[threadId].push({ speaker: persona.name, text: reply });
      return reply;
    } else {
      const responses: Record<string, string> = {};

      for (const persona of activePersonas) {
        const otherActivePersonas = activePersonas.filter(
          (p) => p.id !== persona.id
        );
        const context = createPersonaContext(persona, otherActivePersonas, personalityTone,chatHistories[threadId]);
        const userInstruction = `
          TASK:
          Respond to this message in a group chat to: "${message}"
          RESPONSE GUIDELINES:
          - Respond in Hinglish style as ${persona.name}
          - Keep your response to 3-4 Lines
          - Stay true to your unique voice and personality`;
        const prompt = context + userInstruction;
        const result = await model.generateContent(prompt);
        const reply = result.response.text();

        responses[persona.id] = reply;
        // Add this persona's reply to the chat history.
        chatHistories[threadId].push({ speaker: persona.name, text: reply });
      }
      return responses;
    }
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
}