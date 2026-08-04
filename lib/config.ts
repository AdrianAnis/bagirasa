export const MAX_RADIUS_KM = 15;

export const MATCH_WEIGHTS = {
  distance: 0.4,
  need: 0.35,
  fairness: 0.25,
} as const;

export const BASE_ALLERGENS = [
  "kacang",
  "susu",
  "telur",
  "seafood",
  "gluten",
  "kedelai",
] as const;
