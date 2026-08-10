export const MAX_RADIUS_KM = 15;

export const FAIRNESS_HORIZON_DAYS = 30;

export const EARTH_RADIUS_KM = 6371;

export const MATCH_WEIGHTS = {
  distance: 0.4,
  need: 0.35,
  fairness: 0.25,
} as const;

export const MONEY_DONATION_URL = "";

export const AUTH_ROUTES = ["/login", "/register", "/choose-role"] as const;

export const ROLE_HOME = {
  donor: "/donor",
  recipient: "/recipient",
  admin: "/admin",
} as const;

export const BASE_ALLERGENS = [
  "kacang",
  "susu",
  "telur",
  "seafood",
  "gluten",
  "kedelai",
] as const;
