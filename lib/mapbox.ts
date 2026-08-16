export type GeocodedAddress = {
  lat: number;
  lng: number;
  placeName: string;
};

/**
 * Geocodes a free-text address to coordinates via the Mapbox Geocoding API.
 * Returns null if the address can't be resolved or the request fails —
 * callers should show a clear Norwegian error and let the user retry
 * rather than crash.
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodedAddress | null> {
  const token = process.env.MAPBOX_TOKEN;
  if (!token) {
    throw new Error("MAPBOX_TOKEN er ikke satt.");
  }

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("country", "no");
  url.searchParams.set("limit", "1");

  let response: Response;
  try {
    response = await fetch(url.toString());
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const feature = data.features?.[0];
  if (!feature) {
    return null;
  }

  const [lng, lat] = feature.center as [number, number];
  return { lat, lng, placeName: feature.place_name as string };
}

/**
 * Driving distance in kilometers between two coordinates, via the Mapbox
 * Matrix API. Returns null on failure — same reasoning as geocodeAddress.
 */
export async function getDrivingDistanceKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<number | null> {
  const token = process.env.MAPBOX_TOKEN;
  if (!token) {
    throw new Error("MAPBOX_TOKEN er ikke satt.");
  }

  const coordinates = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = new URL(
    `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coordinates}`
  );
  url.searchParams.set("annotations", "distance");
  url.searchParams.set("access_token", token);

  let response: Response;
  try {
    response = await fetch(url.toString());
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const distanceMeters = data.distances?.[0]?.[1];
  if (typeof distanceMeters !== "number") {
    return null;
  }

  return distanceMeters / 1000;
}
