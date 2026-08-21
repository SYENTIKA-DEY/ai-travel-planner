"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.session) {
          router.push("/");
          router.refresh();
          return;
        }

        setNotice("Account created. Check your inbox to confirm your email, then log in.");
        setMode("login");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <main className="min-h-screen bg-[#F4F1EA] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient dotted flight-path background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none"
        preserveAspectRatio="none"
      >
        <path
          d="M -50 400 Q 300 100 700 350 T 1400 250"
          stroke="#0F5C5C"
          strokeWidth="2"
          strokeDasharray="1 14"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M -50 600 Q 400 750 800 500 T 1500 600"
          stroke="#C1502E"
          strokeWidth="2"
          strokeDasharray="1 14"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      <div className="relative w-full max-w-4xl">
        {/* Boarding pass card */}
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] shadow-2xl rounded-2xl overflow-hidden bg-white">
          {/* Left stub: brand + copy */}
          <div className="relative bg-gradient-to-br from-[#0F5C5C] to-[#0A4040] text-white p-10 md:p-12 flex flex-col justify-between">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-white/60 mb-3">Boarding Pass</p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-4">
                Your journey<br />starts here
              </h1>
              <p className="text-white/70 text-sm max-w-xs">
                Sign in to build, save, and revisit AI-crafted itineraries for every trip you're planning.
              </p>
            </div>

            <div className="mt-10 space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/15 pb-2">
                <span className="text-white/50 uppercase tracking-wider text-xs">Passenger</span>
                <span className="font-medium">Guest Explorer</span>
              </div>
              <div className="flex justify-between border-b border-white/15 pb-2">
                <span className="text-white/50 uppercase tracking-wider text-xs">Date</span>
                <span className="font-medium">{dateStr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 uppercase tracking-wider text-xs">Gate</span>
                <span className="font-medium">Sign In</span>
              </div>
            </div>

            {/* Perforation dots along the right edge, visible on desktop */}
            <div className="hidden md:flex flex-col justify-between absolute right-0 top-0 bottom-0 -mr-[1px] py-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-[#F4F1EA] -mr-1" />
              ))}
            </div>
          </div>

          {/* Right stub: the actual form */}
          <div className="p-10 md:p-12 flex flex-col justify-center">
            <div className="flex gap-6 mb-8 border-b border-gray-200">
              <button
                onClick={() => { setMode("login"); setError(""); setNotice(""); }}
                className={`pb-3 text-sm font-semibold tracking-wide transition ${
                  mode === "login"
                    ? "text-[#C1502E] border-b-2 border-[#C1502E]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                LOG IN
              </button>
              <button
                onClick={() => { setMode("signup"); setError(""); setNotice(""); }}
                className={`pb-3 text-sm font-semibold tracking-wide transition ${
                  mode === "signup"
                    ? "text-[#C1502E] border-b-2 border-[#C1502E]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                SIGN UP
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C1502E] focus:ring-1 focus:ring-[#C1502E] outline-none transition text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C1502E] focus:ring-1 focus:ring-[#C1502E] outline-none transition text-gray-900 placeholder-gray-400"
                />
              </div>

              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              {notice && (
                <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
                  {notice}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-lg font-semibold text-white tracking-wide transition ${
                  loading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#C1502E] hover:bg-[#A8431F]"
                }`}
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                  ? "Log In"
                  : "Create Account"}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-8">
              By continuing, you agree to explore responsibly.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}