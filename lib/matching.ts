export type Coordinate = {
  lat: number;
  lng: number;
};

export function haversineKm(from: Coordinate, to: Coordinate): number {
  throw new Error(`Not implemented: haversineKm ${from.lat} ${to.lat}`);
}

export async function calculateMatches(donationId: string): Promise<never> {
  throw new Error(`Not implemented: calculateMatches ${donationId}`);
}
