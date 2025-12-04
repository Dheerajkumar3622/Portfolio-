
import { GoogleGenAI, Chat } from "@google/genai";
import type { PortfolioData } from '../types';

let ai: GoogleGenAI | null = null;

try {
    // In Vite, process.env.API_KEY is replaced by the actual string at build time.
    // We check this value directly rather than checking the 'process' object, 
    // which might not exist in the browser context.
    const apiKey = process.env.API_KEY;

    if (apiKey) {
        ai = new GoogleGenAI({ apiKey: apiKey });
    } else {
        console.warn("API_KEY not found. AI features (Chat, Video Gen) will be disabled.");
    }
} catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
}

/**
 * Formats the entire portfolio data into a structured string for the AI's context.
 */
const getPortfolioContextString = (data: PortfolioData): string => {
    let context = `This is the portfolio of ${data.profile.name}, an ${data.profile.title}.\n\n`;

    context += `## About ${data.profile.name}\n${data.profile.about}\n\n`;

    context += "## Skills\n";
    data.skills.forEach(skill => {
        context += `- ${skill.name} (Proficiency: ${skill.level}/100)\n`;
    });
    context += "\n";

    context += "## Projects\n";
    data.projects.forEach(project => {
        context += `### Project ID: ${project.id}\n`;
        context += `### Title: ${project.title}\n`;
        context += `**Description:** ${project.description}\n`;
        context += `**Details:** ${project.longDescription}\n`;
        context += `**Key Learning:** ${project.keyLearning}\n`;
        context += `**Technologies:** ${project.technologies.join(', ')}\n\n`;
    });

    context += "## Experience\n";
    data.experience.forEach(exp => {
        context += `- ${exp.role} at ${exp.organization} (${exp.startDate} - ${exp.endDate})\n`;
        context += `  ${exp.description}\n`;
    });
    context += "\n";

    context += "## Education\n";
    data.education.forEach(edu => {
        context += `- ${edu.degree} from ${edu.institution} (${edu.period})\n`;
    });
    context += "\n";

    return context;
};

/**
 * Creates and initializes a new Gemini chat session for the AI Concierge.
 */
export const startPortfolioChat = (portfolioData: PortfolioData): Chat | null => {
    if (!ai) {
        console.error("Gemini AI service is not available (Missing API Key).");
        return null;
    }

    const portfolioContext = getPortfolioContextString(portfolioData);

    const systemInstruction = `You are a sophisticated AI Concierge for the professional portfolio of ${portfolioData.profile.name}. 
    Your purpose is to provide an engaging, helpful, and personalized tour for visitors, such as recruiters or fellow developers.
    You MUST ONLY use the portfolio information provided below to answer questions. Do not invent details or access external information.

    You have special capabilities to make the website interactive. When a user's request implies an action, you can embed special commands in your response. These commands are invisible to the user but will control the webpage.

    **Available Commands:**
    - \`[NAVIGATE_TO:section_id]\`: Use this to scroll the page to a relevant section. 
      Valid section_ids are: about, skills, projects, experience, education, memories, contact.
      Example: If a user asks "Show me his projects", you should respond conversationally and include \`[NAVIGATE_TO:projects]\`.
    - \`[OPEN_PROJECT_MODAL:project_id]\`: Use this to open a detailed view for a specific project. 
      You must find the correct project_id from the context below.
      Example: If a user asks "Tell me more about the IoT project", find its ID (e.g., 'proj1') and include \`[OPEN_PROJECT_MODAL:proj1]\`.
    - \`[DRAFT_EMAIL]\`: Use this to help a user get in touch. 
      When a user expresses strong interest or asks how to contact ${portfolioData.profile.name}, you can offer to draft an email. Including this command will open a pre-written email template for them.

    **Your Persona:**
    - You are friendly, professional, and knowledgeable about every detail in this portfolio.
    - Keep your answers concise and directly related to the user's questions.
    - Proactively offer to show relevant sections or provide more details.

    **PORTFOLIO KNOWLEDGE BASE:**
    ---
    ${portfolioContext}
    ---
    `;

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
    });

    return chat;
};