export const MAX_RADIUS_KM = 15;

export const FAIRNESS_HORIZON_DAYS = 30;

export const EARTH_RADIUS_KM = 6371;

export const MATCH_WEIGHTS = {
  distance: 0.4,
  need: 0.35,
  fairness: 0.25,
} as const;

export const MONEY_DONATION_URL = "";

export const WA_RATE_LIMIT_PER_HOUR = 20;

export const KG_PER_SERVING = 0.4;

export const CO2E_KG_PER_FOOD_KG = 2.5;

export const GEMINI_MODEL = "gemini-2.0-flash";

export const NOTIFICATION_TYPES = {
  donationIncoming: "donation_incoming",
  donationAccepted: "donation_accepted",
  donationRejected: "donation_rejected",
  handoverCompleted: "handover_completed",
  feedbackReceived: "feedback_received",
  verificationUpdated: "verification_updated",
} as const;

export const AUTH_ROUTES = ["/login", "/register", "/choose-role"] as const;

export const ROLE_HOME = {
  donor: "/donor",
  recipient: "/recipient",
  admin: "/admin",
} as const;

export const VERIFICATION_ROUTE = "/verifikasi";

export const PROFILE_ROUTE = {
  donor: "/donor/profile",
  recipient: "/recipient/profile",
} as const;

export const BASE_ALLERGENS = [
  "kacang",
  "susu",
  "telur",
  "seafood",
  "gluten",
  "kedelai",
] as const;
