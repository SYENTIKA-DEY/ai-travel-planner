import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateTrip } from "../lib/gemini";
import { validateTripRequest } from "../lib/validation";

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : null;

    if (!accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();

    // Validate input
    const validation = validateTripRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { destination, budget, days, style = "relaxed" } = body;

    // Generate trip
    const trip = await generateTrip(destination, budget, days, style);

    return NextResponse.json(trip);
  } catch (error: any) {
    console.error("Error in generate-trip:", error);

    // Return appropriate error response
    if (error.message.includes("API")) {
      return NextResponse.json(
        { error: "AI service error", message: "Failed to generate trip. Please try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate trip",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}


