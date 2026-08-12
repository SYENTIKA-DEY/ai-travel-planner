export interface TripRequest {
  destination: string;
  budget: number;
  days: number;
  style?: "relaxed" | "adventure" | "culture" | "luxury";
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateTripRequest(data: any): ValidationResult {
  const errors: string[] = [];

  // Validate destination
  if (!data.destination || typeof data.destination !== "string") {
    errors.push("Destination is required and must be a string");
  } else if (data.destination.trim().length < 2) {
    errors.push("Destination must be at least 2 characters");
  } else if (data.destination.trim().length > 100) {
    errors.push("Destination must be less than 100 characters");
  }

  // Validate budget
  if (!data.budget || typeof data.budget !== "number") {
    errors.push("Budget is required and must be a number");
  } else if (data.budget < 1000) {
    errors.push("Budget must be at least ₹1000");
  } else if (data.budget > 10000000) {
    errors.push("Budget must be less than ₹10,000,000");
  }

  // Validate days
  if (!data.days || typeof data.days !== "number") {
    errors.push("Days is required and must be a number");
  } else if (data.days < 1 || data.days > 30) {
    errors.push("Days must be between 1 and 30");
  }

  // Validate style (optional)
  if (data.style) {
    const validStyles = ["relaxed", "adventure", "culture", "luxury"];
    if (!validStyles.includes(data.style)) {
      errors.push(`Style must be one of: ${validStyles.join(", ")}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
