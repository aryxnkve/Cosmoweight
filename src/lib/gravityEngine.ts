// ═══════════════════════════════════════════════════════════════
//  Gravity Engine — Custom Celestial Body Physics Calculator
//  Pure, side-effect-free functions. No rounding on intermediates.
//  All computation uses IEEE 754 64-bit doubles (native JS number).
// ═══════════════════════════════════════════════════════════════

import type {
  GravityResult,
  CustomWeightResult,
  PlausibilityWarning,
  CalculationStep,
  UnitType,
  MassUnit,
  RadiusUnit,
} from '../data/types';
import { toKilograms, toMetres, massUnitLabels, radiusUnitLabels } from './unitConversion';
import { toKg, fromKg, unitLabels } from '../utils/calculations';

// ─── PHYSICAL CONSTANTS (PRD §4.3) ──────────────────────────
export const G = 6.674e-11;         // N·m²·kg⁻²  (gravitational constant)
export const EARTH_G = 9.807;       // m/s²        (Earth surface gravity)
export const SPEED_OF_LIGHT = 2.998e8; // m/s       (speed of light)

// ═══════════════════════════════════════
// CORE COMPUTATION
// ═══════════════════════════════════════

/**
 * Compute surface gravitational acceleration and derived quantities.
 * g = G × M / r²
 */
export function computeGravity(massKg: number, radiusM: number): GravityResult {
  // Schwarzschild radius: r_s = 2GM / c²
  const schwarzschild_r_m = (2 * G * massKg) / (SPEED_OF_LIGHT * SPEED_OF_LIGHT);
  const is_black_hole = radiusM <= schwarzschild_r_m;

  // Surface gravity
  const g_ms2 = (G * massKg) / (radiusM * radiusM);

  // Ratio vs Earth
  const ratio_vs_earth = g_ms2 / EARTH_G;

  // Body density: M / (4/3 π r³)
  const volume = (4 / 3) * Math.PI * radiusM * radiusM * radiusM;
  const density_kg_m3 = massKg / volume;

  // Escape velocity: √(2GM/r)
  const escape_velocity_ms = Math.sqrt((2 * G * massKg) / radiusM);

  return {
    g_ms2,
    ratio_vs_earth,
    schwarzschild_r_m,
    density_kg_m3,
    escape_velocity_ms,
    is_black_hole,
  };
}

/**
 * Compute the user's weight on the custom body.
 */
export function computeWeight(
  gravityResult: GravityResult,
  userWeightInput: number,
  userUnit: UnitType
): CustomWeightResult {
  // Convert user weight to mass in kg
  let userMassKg: number;
  if (userUnit === 'N') {
    userMassKg = userWeightInput / EARTH_G;
  } else {
    userMassKg = toKg(userWeightInput, userUnit);
  }

  // Weight on body (force = mass × g)
  const weight_on_body_N = userMassKg * gravityResult.g_ms2;
  const weight_on_body_kg = weight_on_body_N / EARTH_G;

  // Weight on Earth (reference)
  const weight_on_earth_N = userMassKg * EARTH_G;
  const weight_on_earth_kg = userMassKg;

  // Convert to user's display unit
  let weight_on_body_unit: number;
  let weight_on_earth_unit: number;

  if (userUnit === 'N') {
    weight_on_body_unit = weight_on_body_N;
    weight_on_earth_unit = weight_on_earth_N;
  } else {
    weight_on_body_unit = fromKg(weight_on_body_kg, userUnit);
    weight_on_earth_unit = fromKg(weight_on_earth_kg, userUnit);
  }

  const weight_diff_unit = weight_on_body_unit - weight_on_earth_unit;

  return {
    ...gravityResult,
    weight_on_body_kg,
    weight_on_body_unit,
    weight_on_earth_kg,
    weight_on_earth_unit,
    weight_diff_unit,
    user_unit: userUnit,
  };
}

// ═══════════════════════════════════════
// PLAUSIBILITY WARNINGS (F-05)
// ═══════════════════════════════════════

export function checkPlausibility(
  g_ms2: number,
  density_kg_m3: number,
  radiusM: number,
  schwarzschild_r_m: number,
  massKg: number
): PlausibilityWarning[] {
  const warnings: PlausibilityWarning[] = [];

  // Black hole (BLOCKED)
  if (radiusM <= schwarzschild_r_m) {
    warnings.push({
      id: 'black_hole',
      severity: 'BLOCKED',
      message: 'This body would collapse into a black hole at this mass and radius. No surface exists.',
      icon: '⛔',
    });
  }

  // Extreme gravity
  if (g_ms2 > 1000) {
    warnings.push({
      id: 'extreme_gravity',
      severity: 'CAUTION',
      message: 'Extreme gravity — would be fatal to humans. Shown for reference only.',
      icon: '⚠️',
    });
  }

  // Neutron-star-like density
  if (density_kg_m3 > 1e8) {
    warnings.push({
      id: 'extreme_density',
      severity: 'CAUTION',
      message: 'This body would be a neutron star or stranger. Physics may differ.',
      icon: '⚠️',
    });
  }

  // Near-zero gravity
  if (g_ms2 > 0 && g_ms2 < 0.001) {
    warnings.push({
      id: 'near_zero',
      severity: 'INFO',
      message: 'Near-zero gravity. A person could escape with a light jump.',
      icon: 'ℹ️',
    });
  }

  // Too small to be spherical
  if (massKg < 1e18) {
    warnings.push({
      id: 'too_small',
      severity: 'INFO',
      message: 'Bodies this small are rarely spherical. Calculation is still valid.',
      icon: 'ℹ️',
    });
  }

  return warnings;
}

// ═══════════════════════════════════════
// STEP-BY-STEP BREAKDOWN (F-04)
// ═══════════════════════════════════════

function formatSci(n: number, sigFigs: number = 6): string {
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 0.001 && abs < 1e6) {
    return n.toPrecision(sigFigs);
  }
  return n.toExponential(sigFigs - 1);
}

export function generateBreakdown(
  massInput: number,
  massUnit: MassUnit,
  radiusInput: number,
  radiusUnit: RadiusUnit,
  userWeight: number,
  userUnit: UnitType,
  result: CustomWeightResult
): CalculationStep[] {
  const massKg = toKilograms(massInput, massUnit);
  const radiusM = toMetres(radiusInput, radiusUnit);
  const massLabel = massUnitLabels[massUnit];
  const radiusLabel = radiusUnitLabels[radiusUnit];
  const weightLabel = unitLabels[userUnit];

  const steps: CalculationStep[] = [
    {
      step: 1,
      label: 'Convert inputs to SI',
      formula: 'M (kg), r (m)',
      substitution: `M = ${formatSci(massInput)} ${massLabel} = ${formatSci(massKg)} kg\nr = ${formatSci(radiusInput)} ${radiusLabel} = ${formatSci(radiusM)} m`,
      result: `M = ${formatSci(massKg)} kg, r = ${formatSci(radiusM)} m`,
    },
    {
      step: 2,
      label: "Apply Newton's formula",
      formula: 'g = G × M / r²',
      substitution: `g = ${formatSci(G)} × ${formatSci(massKg)} / (${formatSci(radiusM)})²`,
      result: `g = ${formatSci(result.g_ms2)} m/s²`,
    },
    {
      step: 3,
      label: 'Compare to Earth',
      formula: 'Ratio = g / g_Earth',
      substitution: `Ratio = ${formatSci(result.g_ms2)} / ${EARTH_G}`,
      result: `Ratio = ${formatSci(result.ratio_vs_earth)}× Earth`,
    },
    {
      step: 4,
      label: 'Compute your weight',
      formula: 'W = m_user × g',
      substitution: `W = ${formatSci(userWeight)} ${weightLabel} × ${formatSci(result.ratio_vs_earth)}`,
      result: `W = ${formatSci(result.weight_on_body_unit)} ${weightLabel}`,
    },
    {
      step: 5,
      label: 'Schwarzschild radius',
      formula: 'r_s = 2GM / c²',
      substitution: `r_s = 2 × ${formatSci(G)} × ${formatSci(massKg)} / (${formatSci(SPEED_OF_LIGHT)})²`,
      result: `r_s = ${formatSci(result.schwarzschild_r_m)} m`,
    },
  ];

  return steps;
}
