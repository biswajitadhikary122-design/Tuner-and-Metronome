import { GoogleGenAI, Type } from "@google/genai";
import type { BeatEmphasis, PlanStep } from '../types';
import { parseTimeSignature } from "./metronomeUtils";

// This instance is for text and AI-powered features
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


/**
 * Gets a music theory explanation from the AI as a stream.
 * @param query The user's question about music theory.
 * @returns An async generator that yields chunks of the formatted explanation.
 */
export async function* getTheoryExplanation(query: string): AsyncGenerator<string> {
    const prompt = `You are an expert music theory teacher with a passion for making complex topics simple and exciting. Your tone is encouraging, clear, and concise.
Explain the following concept to a beginner musician.

**Instructions:**
1.  Start with a simple, one-sentence definition.
2.  Use a simple analogy to help the user understand the core idea.
3.  Break down the explanation into short, easy-to-read paragraphs.
4.  Use Markdown for formatting:
    *   \`**Key Term**\` for important vocabulary.
    *   Use bullet points (-) for lists.
5.  Embed SSML tags for a better audio experience:
    *   \`<break time="400ms"/>\` after headings or between major points.
    *   \`<prosody rate="slow">...</prosody>\` to emphasize short definitions.
    *   Do NOT use the top-level <speak> tag.

**User's Question:** "${query}"`;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (e) {
        console.error("Error getting theory explanation stream:", e);
        throw new Error("The AI failed to provide an explanation. Please try again.");
    }
}


/**
 * Generates a rhythmic emphasis pattern using AI for the metronome.
 */
export const generateGroove = async (prompt: string, timeSignature: string): Promise<BeatEmphasis[]> => {
    const { beatsPerMeasure } = parseTimeSignature(timeSignature);
    const aiPrompt = `You are a rhythm expert. Create a rhythmic emphasis pattern for a musician to practice with.
The user wants a "${prompt}" groove in ${timeSignature} time.

Respond with a JSON object containing a "pattern" array.
The array must contain exactly ${beatsPerMeasure} strings.
Each string must be one of the following values:
- "accent": for a strong beat
- "regular": for a standard beat
- "silent": for a rest or silent beat`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            pattern: {
                type: Type.ARRAY,
                description: `An array of beat emphasis strings of length ${beatsPerMeasure}.`,
                items: { type: Type.STRING },
            },
        },
        required: ['pattern'],
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: aiPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as { pattern: BeatEmphasis[] };
        
        if (result.pattern && result.pattern.length === beatsPerMeasure) {
            return result.pattern;
        } else {
            throw new Error("AI returned a pattern with an incorrect number of beats.");
        }
    } catch (e) {
        console.error("Error parsing groove response from Gemini:", e);
        throw new Error("The AI failed to generate a valid groove. Please try a different prompt.");
    }
};

/**
 * Creates a structured practice plan using AI.
 */
export const createPracticePlan = async (goal: string): Promise<PlanStep[]> => {
    const prompt = `You are an expert music practice coach. A user wants a practice plan. Their goal is: "${goal}".

Create a structured JSON array of practice steps. Each step is an object with three properties: "module", "task", and "duration_seconds".

**Available Modules:**
1.  **"Tuner"**: For tuning an instrument. The "task" should describe what to tune.
2.  **"Metronome"**: For rhythmic exercises. The "task" describes the exercise (e.g., "Play C Major Scale").
3.  **"Message"**: For instructions, breaks, or theory concepts. The "task" is the message to display.

**Rules:**
- A good plan should have at least 3 steps.
- Start with a "Tuner" step if the goal involves an instrument.
- Include a mix of technical exercises and musical application.
- Durations should be reasonable.
- For "Metronome" steps, you can optionally include a "config" object with properties like "bpm" and a "trainerConfig" object for auto-tempo increase.
- The entire response must be ONLY the JSON array.

**Example Response:**
[
  {"module": "Tuner", "task": "Tune guitar to Standard EADGBe", "duration_seconds": 120},
  {"module": "Metronome", "task": "Warm-up: Chromatic scale, 4 notes per beat", "duration_seconds": 180, "config": {"bpm": 80}},
  {"module": "Message", "task": "Take a 30-second break. Stretch your hands.", "duration_seconds": 30},
  {"module": "Metronome", "task": "Practice the main riff of the song", "duration_seconds": 300, "config": {"bpm": 100, "trainerConfig": {"enabled": true, "bpmIncrease": 5, "barInterval": 8}}}
]
`;
    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                module: { type: Type.STRING },
                task: { type: Type.STRING },
                duration_seconds: { type: Type.INTEGER },
                config: { 
                    type: Type.OBJECT,
                    properties: {
                        bpm: { type: Type.INTEGER },
                        trainerConfig: {
                            type: Type.OBJECT,
                            properties: {
                                enabled: { type: Type.BOOLEAN },
                                bpmIncrease: { type: Type.INTEGER },
                                barInterval: { type: Type.INTEGER }
                            }
                        }
                    }
                }
            }
        }
    };
     try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as PlanStep[];
    } catch (e) {
        console.error("Error parsing practice plan from Gemini:", e);
        throw new Error("The AI failed to generate a valid practice plan. Please try again.");
    }
}