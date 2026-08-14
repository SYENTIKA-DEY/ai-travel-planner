"use client";

import { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type TripStyle = "relaxed" | "adventure" | "culture" | "luxury";

interface Day {
  day: number;
  theme?: string;
  activities: {
    time: string;
    activity: string;
    estimatedCost: number;
  }[];
  totalDailyCost?: number;
}

interface Trip {
  destination: string;
  days: Day[];
  totalBudget: number;
  breakdown?: {
    accommodation: number;
    food: number;
    activities: number;
    transport: number;
  };
}

const EXAMPLE_DESTINATIONS = ["Tokyo", "Lisbon", "Bali", "Paris", "Barcelona", "Kyoto"];

const BUDGET_TIERS = {
  budget: { max: 8000, label: "Budget", color: "from-emerald-400 to-teal-500" },
  midRange: { max: 25000, label: "Mid-Range", color: "from-amber-400 to-orange-500" },
  luxury: { max: Infinity, label: "Luxury", color: "from-red-400 to-rose-500" },
};

function getBudgetTier(budget: number) {
  if (budget <= BUDGET_TIERS.budget.max) return BUDGET_TIERS.budget;
  if (budget <= BUDGET_TIERS.midRange.max) return BUDGET_TIERS.midRange;
  return BUDGET_TIERS.luxury;
}

function toSafeNumber(value: number | string | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").replace(/[^0-9.-]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function formatCurrency(value: number | string | undefined): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(toSafeNumber(value));
}

export default function Home() {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");
  const [tripStyle, setTripStyle] = useState<TripStyle>("relaxed");
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState("");
  const [activeDay, setActiveDay] = useState(0);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  const budgetNum = budget ? Number(budget) : 0;
  const budgetTier = getBudgetTier(budgetNum);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTrip(null);

    try {
      const res = await fetch("/api/generate-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          budget: Number(budget),
          days: Number(days),
          style: tripStyle,
        }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data = await res.json();
      console.log("API Response:", data);
      
      // Ensure days is an array
      const normalizedTrip: Trip = {
        destination: data.destination || destination,
        days: Array.isArray(data.days) ? data.days : [],
        totalBudget: data.totalBudget || Number(budget),
        breakdown: data.breakdown,
      };
      
      console.log("Normalized Trip:", normalizedTrip);
      setTrip(normalizedTrip);
      setActiveDay(0);
    } catch (err: any) {
      const errorMsg = err.message || "An error occurred while generating your trip";
      console.error("Error:", errorMsg, err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickExample(dest: string) {
    setDestination(dest);
    setBudget("2000");
    setDays("5");
  }

  async function handleSaveTrip() {
    if (!trip) return;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 15;

    const drawCurrencyRow = (label: string, value: number | string, y: number) => {
      const labelText = `${label}:`;
      const valueText = `₹${formatCurrency(value)}`;
      const leftX = 18;
      const labelWidth = pdf.getTextWidth(labelText);
      const rightX = pageWidth - 18 - pdf.getTextWidth(valueText);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text(labelText, leftX, y);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text(valueText, Math.max(rightX, leftX + labelWidth + 10), y);
    };

    // Title
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.text(trip.destination, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    // Trip Summary
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Duration: ${trip.days?.length || 0} days`, 15, yPosition);
    yPosition += 7;
    pdf.text(`Total Budget: ₹${formatCurrency(trip.totalBudget)}`, 15, yPosition);
    yPosition += 12;

    // Budget Breakdown
    if (trip.breakdown) {
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Budget Breakdown", 15, yPosition);
      yPosition += 8;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      const breakdown = [
        { label: "Accommodation", value: trip.breakdown.accommodation },
        { label: "Food", value: trip.breakdown.food },
        { label: "Activities", value: trip.breakdown.activities },
        { label: "Transport", value: trip.breakdown.transport },
      ];

      breakdown.forEach((item) => {
        if (yPosition > pageHeight - 28) {
          pdf.addPage();
          yPosition = 15;
        }

        pdf.setFont("helvetica", "normal");
        drawCurrencyRow(item.label, item.value, yPosition);
        yPosition += 8;
      });
    }

    yPosition += 5;

    // Daily Itinerary
    trip.days?.forEach((dayData, dayIndex) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 15;
      }

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      const dayTitle = dayData.theme
        ? `Day ${dayIndex + 1}: ${dayData.theme}`
        : `Day ${dayIndex + 1}`;
      pdf.text(dayTitle, 15, yPosition);
      yPosition += 8;

      const dailyTotal = dayData.activities?.reduce(
        (sum, a) => sum + (a.estimatedCost || 0),
        0
      ) || 0;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Estimated Cost:", 20, yPosition);
      yPosition += 7;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text(`₹${formatCurrency(dailyTotal)}`, Math.max(20, pageWidth - 20 - pdf.getTextWidth(`₹${formatCurrency(dailyTotal)}`)), yPosition);
      yPosition += 9;

      // Activities
      dayData.activities?.forEach((activity) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 15;
        }

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        const activityLine = `${activity.time} - ${activity.activity}`;
        const wrappedActivity = pdf.splitTextToSize(activityLine, 170);
        pdf.text(wrappedActivity, 20, yPosition);
        yPosition += wrappedActivity.length * 6;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text("Cost:", 25, yPosition);
        yPosition += 5;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.text(`₹${formatCurrency(activity.estimatedCost)}`, Math.max(25, pageWidth - 25 - pdf.getTextWidth(`₹${formatCurrency(activity.estimatedCost)}`)), yPosition);
        yPosition += 8;
      });

      yPosition += 5;
    });

    // Save the PDF
    pdf.save(`${trip.destination}-trip.pdf`);
  }

  const tripData = trip?.days?.[activeDay];
  const totalDailyCost = tripData?.activities?.reduce(
    (sum, a) => sum + (a.estimatedCost || 0),
    0
  ) || 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-accent-cream via-background to-accent-cream">
      {!trip ? (
        <>
          {/* Hero Section */}
          <section className="relative overflow-hidden px-4 py-16 sm:py-24">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-20 left-10 w-72 h-72 bg-primary-terracotta rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-72 h-72 bg-primary-teal rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
            </div>

            <div className="relative max-w-2xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-5xl sm:text-6xl font-serif font-bold text-foreground mb-4">
                  Your Next Adventure
                </h1>
                <p className="text-xl text-text-light">
                  Let AI craft the perfect journey tailored to your style and budget
                </p>
              </div>

              {/* Main Form Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Destination & Days Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      placeholder="Where to?"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                      className="px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-terracotta focus:outline-none text-foreground placeholder-text-light transition"
                    />
                    <input
                      placeholder="How many days?"
                      type="number"
                      min="1"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      required
                      className="px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-terracotta focus:outline-none text-foreground placeholder-text-light transition"
                    />
                  </div>

                  {/* Budget Input with Live Indicator */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-foreground">Budget (Rupees)</label>
                      {budget && (
                        <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${budgetTier.color} text-white`}>
                          {budgetTier.label}
                        </span>
                      )}
                    </div>
                    <input
                      placeholder="Your budget in INR"
                      type="number"
                      min="0"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-terracotta focus:outline-none text-foreground placeholder-text-light transition"
                    />
                    {budget && (
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${budgetTier.color} transition-all duration-300`}
                          style={{
                            width: `${Math.min((budgetNum / 5000) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Trip Style Selector */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground block">Trip Style</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(["relaxed", "adventure", "culture", "luxury"] as TripStyle[]).map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setTripStyle(style)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                            tripStyle === style
                              ? "bg-primary-terracotta text-white shadow-lg"
                              : "bg-gray-100 text-foreground hover:bg-gray-200"
                          }`}
                        >
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-lg font-semibold text-white text-lg transition-all ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-primary-terracotta to-primary-teal hover:shadow-xl transform hover:scale-105"
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Crafting your adventure...</span>
                      </div>
                    ) : (
                      "Generate Trip"
                    )}
                  </button>
                </form>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded">
                    <p className="font-semibold">Oops!</p>
                    <p className="text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Example Destinations */}
              {!trip && (
                <div className="mt-12 text-center">
                  <p className="text-sm text-text-light mb-4">Try a destination:</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {EXAMPLE_DESTINATIONS.map((dest) => (
                      <button
                        key={dest}
                        onClick={() => handleQuickExample(dest)}
                        className="px-4 py-2 rounded-full border-2 border-primary-terracotta text-primary-terracotta hover:bg-primary-terracotta hover:text-white transition font-medium text-sm"
                      >
                        {dest}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Itinerary Section */}
          <section className="relative px-4 py-12">
            <div className="max-w-5xl mx-auto">
              {/* Header with Back & Save */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground">
                    {trip.destination}
                  </h2>
                  <p className="text-text-light mt-2 break-words">
                    {trip.days?.length || 0} days • ₹{formatCurrency(trip.totalBudget)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setTrip(null);
                      setDestination("");
                      setBudget("");
                      setDays("");
                    }}
                    className="px-6 py-3 rounded-lg border-2 border-primary-teal text-primary-teal hover:bg-primary-teal hover:text-white transition font-medium"
                  >
                    New Trip
                  </button>
                  <button
                    ref={saveButtonRef}
                    onClick={handleSaveTrip}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary-terracotta to-primary-teal text-white hover:shadow-lg transition font-medium sticky top-4"
                  >
                    💾 Save Trip
                  </button>
                </div>
              </div>

              {/* Budget Breakdown */}
              {trip.breakdown && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
                  <h3 className="text-2xl font-serif font-bold text-foreground mb-6">Budget Breakdown</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: "Accommodation", value: trip.breakdown.accommodation, icon: "🏨" },
                      { label: "Food", value: trip.breakdown.food, icon: "🍽️" },
                      { label: "Activities", value: trip.breakdown.activities, icon: "🎭" },
                      { label: "Transport", value: trip.breakdown.transport, icon: "🚗" },
                    ].map((item) => {
                      const safeValue = toSafeNumber(item.value);
                      const totalBudget = toSafeNumber(trip.totalBudget);
                      const percent = totalBudget > 0 ? Math.round((safeValue / totalBudget) * 100) : 0;

                      return (
                        <div key={item.label} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center min-w-0 overflow-hidden">
                          <div className="text-3xl mb-2">{item.icon}</div>
                          <p className="text-sm text-text-light mb-2">{item.label}</p>
                          <p className="text-xl sm:text-2xl font-bold text-primary-terracotta break-all leading-tight">
                            ₹{formatCurrency(safeValue)}
                          </p>
                          <p className="text-xs text-text-light mt-2">
                            {percent}% of total
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Day Tabs */}
              {trip.days && trip.days.length > 0 ? (
                <div className="mb-12 overflow-x-auto">
                  <div className="flex gap-3 pb-4 min-w-max">
                    {trip.days?.map((dayData, idx) => {
                      const dailyTotal = dayData.activities?.reduce(
                        (sum, a) => sum + (a.estimatedCost || 0),
                        0
                      ) || 0;
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveDay(idx)}
                          className={`px-8 py-4 rounded-2xl font-bold transition-all transform hover:scale-105 whitespace-nowrap border-2 ${
                            activeDay === idx
                              ? "bg-gradient-to-r from-primary-terracotta to-primary-teal text-white shadow-2xl border-transparent scale-105"
                              : "bg-white/60 backdrop-blur-sm text-foreground hover:bg-white/80 border-white/40 hover:shadow-lg"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-2xl font-bold ${
                              activeDay === idx 
                                ? "text-white" 
                                : "bg-gradient-to-r from-primary-terracotta to-primary-teal bg-clip-text text-transparent"
                            }`}>
                              Day {idx + 1}
                            </span>
                            <div className="text-left">
                              {dayData.theme && (
                                <div className={`text-sm font-semibold ${activeDay === idx ? "text-white" : "text-primary-terracotta"}`}>
                                  {dayData.theme}
                                </div>
                              )}
                              <div className={`text-xs font-medium break-all ${activeDay === idx ? "text-white/90" : "text-gray-600"}`}>
                                ₹{formatCurrency(dailyTotal)}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    }) || null}
                  </div>
                </div>
              ) : (
                <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                  <p className="text-sm">No itinerary data received. Please check your API connection and try again.</p>
                  {trip.days && (
                    <p className="text-xs mt-2 text-gray-600">Debug: {JSON.stringify(trip.days)}</p>
                  )}
                </div>
              )}

              {/* Day Details Card */}
              {tripData && (
                <div className="bg-gradient-to-br from-white via-white/90 to-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border-2 border-white/40 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="bg-gradient-to-r from-primary-terracotta to-primary-teal rounded-2xl px-6 py-3 transform -rotate-3">
                          <h3 className="text-5xl font-serif font-black text-white">
                            Day {activeDay + 1}
                          </h3>
                        </div>
                      </div>
                      {tripData.theme && (
                        <p className="text-2xl font-semibold text-primary-terracotta ml-1">
                          {tripData.theme}
                        </p>
                      )}
                      <p className="text-lg text-text-light mt-3 font-semibold break-words">
                        💰 Estimated: ₹{formatCurrency(totalDailyCost)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {tripData.activities?.length > 0 ? (
                      tripData.activities.map((activity, idx) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-r from-accent-cream via-white to-gray-50 rounded-2xl p-7 border-l-8 border-primary-terracotta hover:shadow-xl hover:scale-102 transition transform duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3 flex-wrap">
                                <span className="text-lg font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-primary-terracotta to-orange-400 text-white shadow-md">
                                  {activity.time}
                                </span>
                                <span className="text-sm font-bold text-primary-terracotta bg-yellow-50 px-4 py-2 rounded-lg break-all">
                                  ₹{formatCurrency(activity.estimatedCost)}
                                </span>
                              </div>
                              <p className="text-xl font-bold text-foreground leading-relaxed break-words">{activity.activity}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-text-light text-center py-12 text-lg">No activities planned for this day</p>
                    )}
                  </div>

                  {/* Progress indicator */}
                  <div className="mt-10 flex items-center justify-between text-sm font-semibold text-text-light">
                    <span className="text-base">
                      Day {activeDay + 1} of {trip.days?.length || 0}
                    </span>
                    <div className="w-48 h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-primary-terracotta to-primary-teal transition-all duration-300 shadow-lg"
                        style={{
                          width: `${((activeDay + 1) / (trip.days?.length || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
