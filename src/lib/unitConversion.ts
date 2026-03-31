// ═══════════════════════════════════════════════════════════════
//  Unit Conversion Module — Custom Gravity Engine
//  Independently testable. All conversions to SI base units.
// ═══════════════════════════════════════════════════════════════

import type { MassUnit, RadiusUnit } from '../data/types';

// ─── REFERENCE CONSTANTS (PRD §4.3) ─────────────────────────
export const CONSTANTS = {
  EARTH_MASS_KG:    5.972e24,
  JUPITER_MASS_KG:  1.898e27,
  SOLAR_MASS_KG:    1.989e30,
  EARTH_RADIUS_M:   6.371e6,
  AU_M:             1.496e11,
} as const;

// ─── MASS CONVERSION ────────────────────────────────────────
const MASS_TO_KG: Record<MassUnit, number> = {
  kg:           1,
  earth_mass:   CONSTANTS.EARTH_MASS_KG,
  jupiter_mass: CONSTANTS.JUPITER_MASS_KG,
  solar_mass:   CONSTANTS.SOLAR_MASS_KG,
};

export function toKilograms(value: number, unit: MassUnit): number {
  return value * MASS_TO_KG[unit];
}

// ─── RADIUS CONVERSION ─────────────────────────────────────
const RADIUS_TO_M: Record<RadiusUnit, number> = {
  m:            1,
  km:           1e3,
  earth_radius: CONSTANTS.EARTH_RADIUS_M,
  au:           CONSTANTS.AU_M,
};

export function toMetres(value: number, unit: RadiusUnit): number {
  return value * RADIUS_TO_M[unit];
}

// ─── LABELS ─────────────────────────────────────────────────
export const massUnitLabels: Record<MassUnit, string> = {
  kg:           'kg',
  earth_mass:   'M⊕',
  jupiter_mass: 'M♃',
  solar_mass:   'M☉',
};

export const massUnitFullNames: Record<MassUnit, string> = {
  kg:           'Kilograms',
  earth_mass:   'Earth masses',
  jupiter_mass: 'Jupiter masses',
  solar_mass:   'Solar masses',
};

export const radiusUnitLabels: Record<RadiusUnit, string> = {
  m:            'm',
  km:           'km',
  earth_radius: 'R⊕',
  au:           'AU',
};

export const radiusUnitFullNames: Record<RadiusUnit, string> = {
  m:            'Metres',
  km:           'Kilometres',
  earth_radius: 'Earth radii',
  au:           'Astronomical Units',
};
