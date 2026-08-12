import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export interface TripResponse {
  destination: string;
  totalBudget: number;
  days: Day[];
  breakdown: {
    accommodation: number;
    food: number;
    activities: number;
    transport: number;
  };
}

interface Day {
  day: number;
  theme: string;
  activities: Activity[];
}

interface Activity {
  time: string;
  activity: string;
  estimatedCost: number;
}

export async function generateTrip(
  destination: string,
  budget: number,
  days: number,
  style: "relaxed" | "adventure" | "culture" | "luxury" = "relaxed"
): Promise<TripResponse> {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash-lite",
    systemInstruction: `You are a professional travel planner. Return ONLY valid JSON matching this exact structure:
{
  "destination": "string",
  "totalBudget": number,
  "days": [
    {
      "day": number,
      "theme": "string (e.g., 'Exploring the City')",
      "activities": [
        {
          "time": "string (e.g., '9:00 AM - 12:00 PM')",
          "activity": "string",
          "estimatedCost": number
        }
      ]
    }
  ],
  "breakdown": {
    "accommodation": number,
    "food": number,
    "activities": number,
    "transport": number
  }
}`,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const prompt = `Plan a ${days}-day ${style} trip to ${destination} with a total budget of ₹${budget} (Indian Rupees).

Requirements:
- Create a detailed itinerary with activities for each day
- Include 3-5 activities per day with specific time slots
- Provide realistic cost estimates in INR for each activity
- Each activity must have: time slot, activity name, and estimated cost
- Divide the total budget (₹${budget}) among accommodation, food, activities, and transport
- Make sure the sum of all daily activity costs and other expenses totals close to ₹${budget}
- For ${style} trips, adjust recommendations accordingly:
  * Relaxed: Focus on comfort and leisure activities
  * Adventure: Include outdoor and thrilling activities
  * Culture: Focus on historical sites and cultural experiences
  * Luxury: Recommend high-end dining and accommodations

Return ONLY the JSON object with no additional text or markdown.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // Remove markdown code blocks if present
  let jsonText = responseText.trim();
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.replace(/^```json\n/, "").replace(/\n```$/, "");
  } else if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```\n/, "").replace(/\n```$/, "");
  }

  const data = JSON.parse(jsonText);

  // Ensure the response matches our expected structure
  if (!data.destination || !data.days || !Array.isArray(data.days)) {
    throw new Error("Invalid response format from AI");
  }

  return data as TripResponse;
}
