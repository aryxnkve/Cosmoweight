import type { UnitType, CelestialBody, WeightResult, DisplayMode } from '../data/types';

// ═══════════════════════════════════════
// UNIT CONVERSION
// ═══════════════════════════════════════

const CONVERSION_TO_KG: Record<UnitType, number> = {
  kg: 1,
  lbs: 0.453592,
  N: 0.101972, // N / 9.81 = kg
  stone: 6.35029,
};

const CONVERSION_FROM_KG: Record<UnitType, number> = {
  kg: 1,
  lbs: 2.20462,
  N: 9.81, // kg * 9.81 = N
  stone: 0.157473,
};

export function toKg(value: number, unit: UnitType): number {
  return value * CONVERSION_TO_KG[unit];
}

export function fromKg(valueKg: number, unit: UnitType): number {
  return valueKg * CONVERSION_FROM_KG[unit];
}

export function convertUnit(value: number, from: UnitType, to: UnitType): number {
  const kg = toKg(value, from);
  return fromKg(kg, to);
}

export const unitLabels: Record<UnitType, string> = {
  kg: 'kg',
  lbs: 'lbs',
  N: 'N',
  stone: 'st',
};

export const unitFullNames: Record<UnitType, string> = {
  kg: 'Kilograms',
  lbs: 'Pounds',
  N: 'Newtons',
  stone: 'Stone',
};

// ═══════════════════════════════════════
// WEIGHT CALCULATION
// ═══════════════════════════════════════

export function calculateWeight(
  inputValue: number,
  inputUnit: UnitType,
  body: CelestialBody
): WeightResult {
  // Convert input to kg (mass on earth)
  let massKg: number;

  if (inputUnit === 'N') {
    // Newtons are force on Earth, so mass = N / 9.81
    massKg = inputValue / 9.81;
  } else {
    massKg = toKg(inputValue, inputUnit);
  }

  // Calculate weight on the body
  const weightKg = massKg * body.gravityMultiplier;

  // Convert result back to user's selected unit
  let weightInSelectedUnit: number;
  if (inputUnit === 'N') {
    weightInSelectedUnit = massKg * body.surfaceGravityMs2;
  } else {
    weightInSelectedUnit = fromKg(Math.abs(weightKg), inputUnit);
    if (weightKg < 0) weightInSelectedUnit = -weightInSelectedUnit;
  }

  const displayMode = getDisplayMode(body);

  const result: WeightResult = {
    weightInSelectedUnit,
    weightInKg: weightKg,
    gravityMultiplier: body.gravityMultiplier,
    surfaceGravityMs2: body.surfaceGravityMs2,
    displayMode,
  };

  // Add fun context for light/microgravity bodies
  if (
    displayMode === 'light' ||
    displayMode === 'microgravity'
  ) {
    result.jumpHeight = calculateJumpHeight(body.gravityMultiplier);
  }

  if (body.escapeVelocityKmS && body.escapeVelocityKmS < 1) {
    result.escapeVelocityContext = getEscapeVelocityContext(body.escapeVelocityKmS);
  }

  return result;
}

export function getDisplayMode(body: CelestialBody): DisplayMode {
  return body.displayMode;
}

// ═══════════════════════════════════════
// FUN FACT CALCULATIONS
// ═══════════════════════════════════════

/** Calculate how high you could jump on a body (assuming ~0.5m jump on Earth) */
export function calculateJumpHeight(gravityMultiplier: number): number {
  if (gravityMultiplier <= 0) return Infinity;
  const earthJumpHeight = 0.5; // meters
  return earthJumpHeight / gravityMultiplier;
}

/** Generate human-readable escape velocity context */
export function getEscapeVelocityContext(escapeVelocityKmS: number): string {
  const ms = escapeVelocityKmS * 1000;
  if (ms < 5) return `A gentle toss could send objects into space (escape velocity: ${ms.toFixed(1)} m/s)`;
  if (ms < 12) return `A bicycle could reach escape velocity here (${ms.toFixed(1)} m/s)`;
  if (ms < 30) return `A car could reach escape velocity (${ms.toFixed(0)} m/s)`;
  if (ms < 100) return `A fast pitch could reach orbital velocity (${ms.toFixed(0)} m/s)`;
  return `Escape velocity: ${escapeVelocityKmS.toFixed(2)} km/s`;
}

// ═══════════════════════════════════════
// NUMBER FORMATTING
// ═══════════════════════════════════════

export function formatWeight(value: number, _unit?: UnitType): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '−' : '';

  if (absValue === 0) return '0';
  if (absValue >= 1e15) return `${sign}${absValue.toExponential(2)}`;
  if (absValue >= 1000000) return `${sign}${(absValue / 1000000).toFixed(2)}M`;
  if (absValue >= 10000) return `${sign}${(absValue / 1000).toFixed(1)}K`;
  if (absValue >= 100) return `${sign}${absValue.toFixed(1)}`;
  if (absValue >= 1) return `${sign}${absValue.toFixed(2)}`;
  if (absValue >= 0.01) return `${sign}${absValue.toFixed(4)}`;
  if (absValue >= 0.0001) return `${sign}${absValue.toFixed(6)}`;
  return `${sign}${absValue.toExponential(3)}`;
}

export function formatGravityMultiplier(multiplier: number): string {
  if (multiplier === 0) return '0×';
  const abs = Math.abs(multiplier);
  const sign = multiplier < 0 ? '−' : '';
  if (abs >= 1e9) return `${sign}${abs.toExponential(1)}×`;
  if (abs >= 1000000) return `${sign}${(abs / 1000000).toFixed(1)}M×`;
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}K×`;
  if (abs >= 100) return `${sign}${abs.toFixed(0)}×`;
  if (abs >= 1) return `${sign}${abs.toFixed(2)}×`;
  if (abs >= 0.01) return `${sign}${abs.toFixed(3)}×`;
  if (abs >= 0.0001) return `${sign}${abs.toFixed(5)}×`;
  return `${sign}${abs.toExponential(2)}×`;
}

export function formatDistance(km: number | null): string {
  if (km === null) return 'N/A';
  if (km === 0) return 'You are here';
  if (km < 1000) return `${km.toFixed(0)} km`;
  if (km < 1000000) return `${(km / 1000).toFixed(1)}K km`;
  if (km < 1e9) return `${(km / 1e6).toFixed(1)}M km`;
  return `${(km / 1e9).toFixed(2)}B km`;
}

export function formatTemperature(tempC: number | null): string {
  if (tempC === null) return 'N/A';
  return `${tempC > 0 ? '+' : ''}${tempC}°C`;
}

// ═══════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════

export function validateWeightInput(value: string): { valid: boolean; error?: string } {
  if (!value || value.trim() === '') return { valid: false, error: 'Please enter a weight' };
  const num = parseFloat(value);
  if (isNaN(num)) return { valid: false, error: 'Please enter a valid number' };
  if (num < 0.1) return { valid: false, error: 'Weight must be at least 0.1' };
  if (num > 99999) return { valid: false, error: 'Weight must be under 100,000' };
  return { valid: true };
}

// ═══════════════════════════════════════
// LOCALE DETECTION
// ═══════════════════════════════════════

export function detectDefaultUnit(): UnitType {
  try {
    const locale = navigator.language || 'en-US';
    const imperialLocales = ['en-US', 'en-GB', 'en-MM', 'en-LR'];
    if (imperialLocales.some((l) => locale.startsWith(l.split('-')[0]) && locale.includes(l.split('-')[1]))) {
      if (locale === 'en-GB') return 'stone';
      return 'lbs';
    }
    return 'kg';
  } catch {
    return 'kg';
  }
}

// ═══════════════════════════════════════
// SHARE URL
// ═══════════════════════════════════════

export function generateShareUrl(weight: number, unit: UnitType, bodyId: string): string {
  const params = new URLSearchParams({
    w: weight.toString(),
    u: unit,
    b: bodyId,
  });
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

export function parseShareUrl(): { weight?: number; unit?: UnitType; bodyId?: string } | null {
  const params = new URLSearchParams(window.location.search);
  const w = params.get('w');
  const u = params.get('u') as UnitType | null;
  const b = params.get('b');
  if (!w && !u && !b) return null;
  return {
    weight: w ? parseFloat(w) : undefined,
    unit: u || undefined,
    bodyId: b || undefined,
  };
}
