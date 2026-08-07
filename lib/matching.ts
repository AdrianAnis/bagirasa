import {
  EARTH_RADIUS_KM,
  FAIRNESS_HORIZON_DAYS,
  MATCH_WEIGHTS,
  MAX_RADIUS_KM,
} from "@/lib/config";

export type Coordinate = {
  lat: number;
  lng: number;
};

export type MatchCandidate = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  currentNeed: number;
  allergenRestrictions: string[];
  halalOnly: boolean;
  lastReceivedAt: string | null;
};

export type DonationProfile = {
  totalServings: number;
  isHalal: boolean;
  allergens: string[];
};

export type ScoredCandidate = {
  candidate: MatchCandidate;
  distanceKm: number;
  proximityScore: number;
  needScore: number;
  fairnessScore: number;
  matchScore: number;
};

export type RejectionReason =
  | "di luar radius"
  | "tidak menerima makanan non-halal"
  | "alergen tidak aman"
  | "tidak sedang membutuhkan";

export type RejectedCandidate = {
  candidate: MatchCandidate;
  distanceKm: number;
  reason: RejectionReason;
};

export type Allocation = {
  recipientId: string;
  recipientName: string;
  allocatedServings: number;
  distanceKm: number;
  matchScore: number | null;
};

export type MatchingOutcome = {
  allocations: Allocation[];
  eligible: ScoredCandidate[];
  rejected: RejectedCandidate[];
  allocatedServings: number;
  remainingServings: number;
};

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineKm(from: Coordinate, to: Coordinate): number {
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

function daysSince(value: string | null): number {
  if (!value) {
    return FAIRNESS_HORIZON_DAYS;
  }

  const elapsedMs = Date.now() - new Date(value).getTime();
  return Math.max(0, elapsedMs / (1000 * 60 * 60 * 24));
}

function hasUnsafeAllergen(
  donationAllergens: string[],
  restrictions: string[],
): boolean {
  const normalized = new Set(
    restrictions.map((allergen) => allergen.trim().toLowerCase()),
  );

  return donationAllergens.some((allergen) =>
    normalized.has(allergen.trim().toLowerCase()),
  );
}

function rejectionReason(
  donation: DonationProfile,
  candidate: MatchCandidate,
  distanceKm: number,
): RejectionReason | null {
  if (distanceKm > MAX_RADIUS_KM) {
    return "di luar radius";
  }

  if (!donation.isHalal && candidate.halalOnly) {
    return "tidak menerima makanan non-halal";
  }

  if (hasUnsafeAllergen(donation.allergens, candidate.allergenRestrictions)) {
    return "alergen tidak aman";
  }

  if (candidate.currentNeed <= 0) {
    return "tidak sedang membutuhkan";
  }

  return null;
}

function scoreCandidate(
  candidate: MatchCandidate,
  distanceKm: number,
): ScoredCandidate {
  const proximityScore = 1 - Math.min(distanceKm / MAX_RADIUS_KM, 1);

  const needScore =
    candidate.capacity > 0
      ? Math.min(candidate.currentNeed / candidate.capacity, 1)
      : 0;

  const fairnessScore = Math.min(
    daysSince(candidate.lastReceivedAt) / FAIRNESS_HORIZON_DAYS,
    1,
  );

  const matchScore =
    MATCH_WEIGHTS.distance * proximityScore +
    MATCH_WEIGHTS.need * needScore +
    MATCH_WEIGHTS.fairness * fairnessScore;

  return {
    candidate,
    distanceKm,
    proximityScore,
    needScore,
    fairnessScore,
    matchScore,
  };
}

export function rankCandidates(
  donorLocation: Coordinate,
  donation: DonationProfile,
  candidates: MatchCandidate[],
): { eligible: ScoredCandidate[]; rejected: RejectedCandidate[] } {
  const eligible: ScoredCandidate[] = [];
  const rejected: RejectedCandidate[] = [];

  for (const candidate of candidates) {
    const distanceKm = haversineKm(donorLocation, {
      lat: candidate.lat,
      lng: candidate.lng,
    });

    const reason = rejectionReason(donation, candidate, distanceKm);

    if (reason) {
      rejected.push({ candidate, distanceKm, reason });
      continue;
    }

    eligible.push(scoreCandidate(candidate, distanceKm));
  }

  eligible.sort((a, b) => b.matchScore - a.matchScore);

  return { eligible, rejected };
}

export function allocateAuto(
  donorLocation: Coordinate,
  donation: DonationProfile,
  candidates: MatchCandidate[],
): MatchingOutcome {
  const { eligible, rejected } = rankCandidates(
    donorLocation,
    donation,
    candidates,
  );

  const allocations: Allocation[] = [];
  let remaining = donation.totalServings;

  for (const scored of eligible) {
    if (remaining <= 0) {
      break;
    }

    const allocated = Math.min(remaining, scored.candidate.currentNeed);

    if (allocated <= 0) {
      continue;
    }

    allocations.push({
      recipientId: scored.candidate.id,
      recipientName: scored.candidate.name,
      allocatedServings: allocated,
      distanceKm: Number(scored.distanceKm.toFixed(2)),
      matchScore: Number(scored.matchScore.toFixed(4)),
    });

    remaining -= allocated;
  }

  return {
    allocations,
    eligible,
    rejected,
    allocatedServings: donation.totalServings - remaining,
    remainingServings: remaining,
  };
}

export function allocateManual(
  donorLocation: Coordinate,
  donation: DonationProfile,
  candidates: MatchCandidate[],
  selectedIds: string[],
): MatchingOutcome {
  const { eligible, rejected } = rankCandidates(
    donorLocation,
    donation,
    candidates,
  );

  const eligibleById = new Map(
    eligible.map((scored) => [scored.candidate.id, scored]),
  );

  const allocations: Allocation[] = [];
  const seen = new Set<string>();
  let remaining = donation.totalServings;

  for (const id of selectedIds) {
    if (remaining <= 0 || seen.has(id)) {
      continue;
    }

    const scored = eligibleById.get(id);

    if (!scored) {
      continue;
    }

    const allocated = Math.min(remaining, scored.candidate.currentNeed);

    if (allocated <= 0) {
      continue;
    }

    seen.add(id);

    allocations.push({
      recipientId: scored.candidate.id,
      recipientName: scored.candidate.name,
      allocatedServings: allocated,
      distanceKm: Number(scored.distanceKm.toFixed(2)),
      matchScore: null,
    });

    remaining -= allocated;
  }

  return {
    allocations,
    eligible,
    rejected,
    allocatedServings: donation.totalServings - remaining,
    remainingServings: remaining,
  };
}
