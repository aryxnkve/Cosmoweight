export type UnitType = 'kg' | 'lbs' | 'N' | 'stone';

export type Category =
  | 'planet'
  | 'moon'
  | 'dwarf_planet'
  | 'major_moon'
  | 'asteroid'
  | 'star'
  | 'zero_g'
  | 'microgravity'
  | 'anti_gravity'
  | 'hypothetical'
  | 'custom';

export type SubCategory = 'real' | 'theoretical' | null;

export type DisplayMode =
  | 'normal'
  | 'heavy'
  | 'light'
  | 'zero_g'
  | 'microgravity'
  | 'negative_weight';

export type ViewType = 'calculator' | 'compare' | 'explore' | 'custom';

export type ThemeType = 'dark' | 'light' | 'system';

export type SortField = 'name' | 'weight' | 'gravity';
export type SortDirection = 'asc' | 'desc';

// ═══════════════════════════════════════
// CUSTOM GRAVITY ENGINE TYPES
// ═══════════════════════════════════════

export type MassUnit = 'kg' | 'earth_mass' | 'jupiter_mass' | 'solar_mass';
export type RadiusUnit = 'm' | 'km' | 'earth_radius' | 'au';

export type WarningSeverity = 'INFO' | 'CAUTION' | 'BLOCKED';

export interface GravityResult {
  g_ms2: number;
  ratio_vs_earth: number;
  schwarzschild_r_m: number;
  density_kg_m3: number;
  escape_velocity_ms: number;
  is_black_hole: boolean;
}

export interface CustomWeightResult extends GravityResult {
  weight_on_body_kg: number;
  weight_on_body_unit: number;
  weight_on_earth_kg: number;
  weight_on_earth_unit: number;
  weight_diff_unit: number;
  user_unit: UnitType;
}

export interface PlausibilityWarning {
  id: string;
  severity: WarningSeverity;
  message: string;
  icon: string;
}

export interface CalculationStep {
  step: number;
  label: string;
  formula: string;
  substitution: string;
  result: string;
}

// ═══════════════════════════════════════
// EXISTING TYPES
// ═══════════════════════════════════════

export interface CelestialBody {
  id: string;
  name: string;
  category: Category;
  subCategory: SubCategory;
  surfaceGravityMs2: number;
  gravityMultiplier: number;
  massKg: number | null;
  radiusKm: number | null;
  avgTempC: number | null;
  escapeVelocityKmS: number | null;
  distanceFromEarthKmAvg: number | null;
  funFact: string;
  gravityNote: string | null;
  disclaimer: string | null;
  displayMode: DisplayMode;
  accentColor: string;
  cssGradient: string;
  imageUrl?: string;
  wikipediaUrl: string;
  emoji: string;
}

export interface WeightResult {
  weightInSelectedUnit: number;
  weightInKg: number;
  gravityMultiplier: number;
  surfaceGravityMs2: number;
  displayMode: DisplayMode;
  jumpHeight?: number;
  escapeVelocityContext?: string;
}

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}
