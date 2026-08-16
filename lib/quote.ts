import type { ServiceType, PriceBreakdown } from "./pricing";
import type { GeocodedAddress } from "./mapbox";

export type QuoteResult = {
  pickup: GeocodedAddress;
  delivery: GeocodedAddress;
  distanceKm: number;
  breakdown: PriceBreakdown;
};

export type QuoteFormData = {
  pickupAddress: string;
  deliveryAddress: string;
  weightKg: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  colli: string;
  serviceType: ServiceType;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

export const initialQuoteFormData: QuoteFormData = {
  pickupAddress: "",
  deliveryAddress: "",
  weightKg: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  colli: "1",
  serviceType: "standard",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
};

export type QuoteFormErrors = Partial<Record<keyof QuoteFormData, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isPositiveNumber(value: string): boolean {
  const num = Number(value);
  return value.trim() !== "" && Number.isFinite(num) && num > 0;
}

export function validateQuoteForm(data: QuoteFormData): QuoteFormErrors {
  const errors: QuoteFormErrors = {};

  if (!data.pickupAddress.trim()) {
    errors.pickupAddress = "Skriv inn henteadresse.";
  }
  if (!data.deliveryAddress.trim()) {
    errors.deliveryAddress = "Skriv inn leveringsadresse.";
  }
  if (!isPositiveNumber(data.weightKg)) {
    errors.weightKg = "Skriv inn en gyldig vekt.";
  }
  if (!isPositiveNumber(data.lengthCm)) {
    errors.lengthCm = "Skriv inn en gyldig lengde.";
  }
  if (!isPositiveNumber(data.widthCm)) {
    errors.widthCm = "Skriv inn en gyldig bredde.";
  }
  if (!isPositiveNumber(data.heightCm)) {
    errors.heightCm = "Skriv inn en gyldig høyde.";
  }
  if (!isPositiveNumber(data.colli) || !Number.isInteger(Number(data.colli))) {
    errors.colli = "Skriv inn et gyldig antall kolli.";
  }
  if (!data.customerName.trim() || data.customerName.trim().length < 2) {
    errors.customerName = "Skriv inn fullt navn.";
  }
  if (!data.customerEmail.trim()) {
    errors.customerEmail = "E-post er påkrevd.";
  } else if (!EMAIL_REGEX.test(data.customerEmail.trim())) {
    errors.customerEmail = "Skriv inn en gyldig e-postadresse.";
  }
  if (!data.customerPhone.trim()) {
    errors.customerPhone = "Telefonnummer er påkrevd.";
  }

  return errors;
}

export function hasErrors(errors: QuoteFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
