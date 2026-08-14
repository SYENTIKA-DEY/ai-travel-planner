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

CRITICAL REQUIREMENTS:
- Create EXACTLY ${days} day entries in the JSON array. Do NOT return fewer than ${days} days.
- Each day must be a separate object in the days array, numbered from 1 to ${days}.
- Include 3-5 activities per day with specific time slots.
- Provide realistic cost estimates in INR for each activity.
- Each activity must have: time slot, activity name, and estimated cost.
- Divide the total budget (₹${budget}) among accommodation, food, activities, and transport.
- Make sure the sum of all daily costs and other expenses totals close to ₹${budget}.
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

  const normalizedDays = Array.from({ length: days }, (_, index) => {
    const existingDay = data.days[index];

    if (existingDay && typeof existingDay === "object") {
      return {
        ...existingDay,
        day: index + 1,
        theme: existingDay.theme || `Day ${index + 1}`,
        activities: Array.isArray(existingDay.activities) && existingDay.activities.length > 0
          ? existingDay.activities.map((activity: any, activityIndex: number) => ({
              time: activity.time || `${activityIndex + 1}:00 PM`,
              activity: activity.activity || `Explore ${destination}`,
              estimatedCost: Number(activity.estimatedCost) || 0,
            }))
          : [
              {
                time: "9:00 AM - 12:00 PM",
                activity: `Explore ${destination}`,
                estimatedCost: Math.round((budget / Math.max(days, 1)) * 0.35),
              },
              {
                time: "1:00 PM - 4:00 PM",
                activity: `Local highlights for ${style} travel`,
                estimatedCost: Math.round((budget / Math.max(days, 1)) * 0.3),
              },
              {
                time: "7:00 PM - 9:00 PM",
                activity: `Evening experience in ${destination}`,
                estimatedCost: Math.round((budget / Math.max(days, 1)) * 0.35),
              },
            ],
      };
    }

    return {
      day: index + 1,
      theme: `Day ${index + 1}`,
      activities: [
        {
          time: "9:00 AM - 12:00 PM",
          activity: `Explore ${destination}`,
          estimatedCost: Math.round((budget / Math.max(days, 1)) * 0.35),
        },
        {
          time: "1:00 PM - 4:00 PM",
          activity: `Local highlights for ${style} travel`,
          estimatedCost: Math.round((budget / Math.max(days, 1)) * 0.3),
        },
        {
          time: "7:00 PM - 9:00 PM",
          activity: `Evening experience in ${destination}`,
          estimatedCost: Math.round((budget / Math.max(days, 1)) * 0.35),
        },
      ],
    };
  });

  return {
    ...data,
    destination: data.destination || destination,
    totalBudget: Number(data.totalBudget) || budget,
    days: normalizedDays,
    breakdown: data.breakdown || {
      accommodation: Math.round(budget * 0.35),
      food: Math.round(budget * 0.25),
      activities: Math.round(budget * 0.25),
      transport: Math.round(budget * 0.15),
    },
  } as TripResponse;
}
