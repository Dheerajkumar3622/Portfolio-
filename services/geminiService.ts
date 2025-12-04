
import { GoogleGenAI, Chat } from "@google/genai";
import type { PortfolioData, Project } from '../types';

let ai: GoogleGenAI | null = null;

try {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey: apiKey });
    } else {
        console.warn("API_KEY not found. AI features will be disabled.");
    }
} catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
}

// --- 1. Semantic Search ---
export const semanticSearchProjects = async (query: string, projects: Project[]): Promise<string[]> => {
    if (!ai) return projects.map(p => p.id);

    // We pass the list of projects to the LLM and ask it to pick the relevant ones based on the user's natural language query.
    const projectList = projects.map(p => `ID: ${p.id}, Title: ${p.title}, Tech: ${p.technologies.join(', ')}, Desc: ${p.description}`).join('\n');
    
    const prompt = `
    You are a search engine for a portfolio.
    User Query: "${query}"
    
    Here is the list of projects:
    ${projectList}
    
    Return a JSON array of strings containing ONLY the IDs of the projects that are relevant to the query. 
    If the query is vague, pick the best matches. If nothing matches, return an empty array.
    Example Output: ["proj1", "proj3"]
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        
        const text = response.text;
        if (!text) return [];
        return JSON.parse(text);
    } catch (e) {
        console.error("Semantic search failed", e);
        return projects.map(p => p.id); // Fallback to all
    }
};

// --- 2. Sentiment Analysis ---
export const analyzeSentiment = async (message: string): Promise<{ score: number; label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'TOXIC' }> => {
    if (!ai) return { score: 0, label: 'NEUTRAL' };

    const prompt = `
    Analyze the sentiment of this guestbook message: "${message}"
    Return JSON: { "score": number (-1 to 1), "label": string (POSITIVE, NEUTRAL, NEGATIVE, or TOXIC) }
    TOXIC means hate speech, insults, or spam.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        return { score: 0, label: 'NEUTRAL' };
    }
};

// --- 3. AI Project Explain/Insight ---
export const generateProjectInsight = async (project: Project): Promise<string> => {
    if (!ai) return "AI Service Unavailable.";

    const prompt = `
    Explain this technical project to a non-technical recruiter in 2 sentences. 
    Focus on the business value and the complexity solved.
    
    Project: ${project.title}
    Description: ${project.longDescription}
    Tech: ${project.technologies.join(', ')}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Could not generate insight.";
    } catch (e) {
        return "Error generating insight.";
    }
};

// --- Existing Chat Logic ---
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
    return context;
};

export const startPortfolioChat = (portfolioData: PortfolioData): Chat | null => {
    if (!ai) return null;
    const portfolioContext = getPortfolioContextString(portfolioData);
    const systemInstruction = `You are a sophisticated AI Concierge for ${portfolioData.profile.name}. 
    Use the data below to answer questions.
    Commands: [NAVIGATE_TO:section_id], [OPEN_PROJECT_MODAL:project_id].
    Data: ${portfolioContext}`;

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
    });
};
