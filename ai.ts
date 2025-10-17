import { GoogleGenAI, Chat, Type, GenerateContentResponse } from '@google/genai';

// --- API CONFIGURATION ---
// As requested, the API key is hardcoded here for simplicity.
// In a production environment, it is strongly recommended to use environment variables.
const API_KEY = "AIzaSyDbtfQcsPNucoeTcXibPH6BRh2eUagrch4";

let ai: GoogleGenAI;

try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} catch (error) {
    console.error("Failed to initialize GoogleGenAI. Please check your API key.", error);
    // You could implement a fallback or display an error to the user here.
}


// --- CHATBOT FUNCTIONALITY ---

/**
 * Initializes and returns a new AI chat session for the EcoBot.
 * @returns A Chat session object or null if initialization fails.
 */
export function initializeChatSession(): Chat | null {
    if (!ai) {
        console.error("AI instance not available for chat session.");
        return null;
    }
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: "You are EcoBot, a friendly and knowledgeable assistant for the GreenMap application. Your goal is to help users understand and use the app effectively. You can answer questions about how to report tree plantations or pollution, explain the data analysis page, and provide general information about environmental conservation. Keep your responses concise, helpful, and encouraging. Use emojis where appropriate to maintain a friendly tone! 🌳🌍💚",
        }
    });
}


// --- ANALYSIS PAGE FUNCTIONALITY ---

export interface AIAnalysisResult {
    summary: string;
    observations: string[];
    recommendations: string[];
    score: number;
}

/**
 * Generates an AI-powered analysis of environmental report data.
 * @param analysisData - The processed statistical data from the reports.
 * @returns A promise that resolves to the AIAnalysisResult object.
 */
export async function generateReportAnalysis(analysisData: any): Promise<AIAnalysisResult> {
    if (!ai) {
        throw new Error("AI instance is not initialized.");
    }

    const prompt = `
        Analyze the following environmental report data from the GreenMap application and provide insights.
        The data includes ${analysisData.totalReports} total reports, with ${analysisData.treeCount} tree plantations and ${analysisData.pollutionCount} pollution hotspots.
        The trend of reports over the last few months is as follows (value is number of reports): ${JSON.stringify(analysisData.monthlyData.map((d: any) => ({ month: d.label, count: d.value })))}.

        Based on this data, your task is to generate a concise analysis.
        Your response MUST be a valid JSON object that strictly adheres to the following schema:
        {
          "summary": "A brief, insightful summary of the data in about 2-3 sentences. Mention the overall trend and key takeaway.",
          "observations": ["An array of exactly 3 key observations from the data as strings. Each observation should be a complete sentence."],
          "recommendations": ["An array of exactly 3 actionable recommendations based on the observations, as strings. Each recommendation should be a complete sentence."],
          "score": "A positivity score from 1 (very negative environmental impact) to 10 (very positive environmental impact), as an integer. Base this on the ratio of tree plantations to pollution reports and the overall reporting trend."
        }
    `;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING },
            observations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
            recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
            score: { type: Type.INTEGER }
        },
        required: ["summary", "observations", "recommendations", "score"]
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema,
        },
    });

    const resultText = response.text;
    return JSON.parse(resultText) as AIAnalysisResult;
}


// --- FEEDBACK PAGE FUNCTIONALITY ---

export interface FeedbackAnalysisResult {
    category: string;
    sentiment: string;
}

/**
 * Analyzes user feedback to categorize it and determine its sentiment.
 * @param feedbackType - The initial type selected by the user.
 * @param message - The user's feedback message.
 * @returns A promise that resolves to the FeedbackAnalysisResult object.
 */
export async function analyzeFeedback(feedbackType: string, message: string): Promise<FeedbackAnalysisResult> {
    if (!ai) {
        throw new Error("AI instance is not initialized.");
    }

    const prompt = `
        Analyze the following user feedback for the GreenMap application.
        Classify the feedback into one of these categories: "Bug Report", "Feature Request", "General Comment", or "Praise".
        Also, determine the sentiment of the feedback: "Positive", "Negative", or "Neutral".
        The user selected this initial type: "${feedbackType}".
        Feedback message: "${message}"
        Return the result as a valid JSON object only.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            category: { type: Type.STRING },
            sentiment: { type: Type.STRING }
        },
        required: ["category", "sentiment"]
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema,
        },
    });
    
    const resultText = response.text;
    return JSON.parse(resultText) as FeedbackAnalysisResult;
}
