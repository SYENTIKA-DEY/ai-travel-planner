import { NextResponse } from "next/server";

export async function GET() {
  const isApiKeyConfigured = !!process.env.GEMINI_API_KEY;

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      checks: {
        geminiApiKey: isApiKeyConfigured ? "configured" : "missing",
      },
    },
    { status: isApiKeyConfigured ? 200 : 503 }
  );
}
