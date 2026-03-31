import { describe, it, expect } from 'vitest';
import { toKilograms, toMetres, CONSTANTS } from '../lib/unitConversion';

describe('toKilograms', () => {
  it('kg → kg (identity)', () => {
    expect(toKilograms(100, 'kg')).toBe(100);
  });

  it('1 Earth mass → 5.972e24 kg', () => {
    expect(toKilograms(1, 'earth_mass')).toBe(CONSTANTS.EARTH_MASS_KG);
  });

  it('1 Jupiter mass → 1.898e27 kg', () => {
    expect(toKilograms(1, 'jupiter_mass')).toBe(CONSTANTS.JUPITER_MASS_KG);
  });

  it('1 Solar mass → 1.989e30 kg', () => {
    expect(toKilograms(1, 'solar_mass')).toBe(CONSTANTS.SOLAR_MASS_KG);
  });

  it('2.5 Earth masses', () => {
    expect(toKilograms(2.5, 'earth_mass')).toBe(2.5 * CONSTANTS.EARTH_MASS_KG);
  });

  it('0 kg → 0', () => {
    expect(toKilograms(0, 'kg')).toBe(0);
  });

  it('fractional Solar mass', () => {
    expect(toKilograms(0.001, 'solar_mass')).toBeCloseTo(0.001 * CONSTANTS.SOLAR_MASS_KG, 15);
  });
});

describe('toMetres', () => {
  it('m → m (identity)', () => {
    expect(toMetres(500, 'm')).toBe(500);
  });

  it('1 km → 1000 m', () => {
    expect(toMetres(1, 'km')).toBe(1000);
  });

  it('1 Earth radius → 6.371e6 m', () => {
    expect(toMetres(1, 'earth_radius')).toBe(CONSTANTS.EARTH_RADIUS_M);
  });

  it('1 AU → 1.496e11 m', () => {
    expect(toMetres(1, 'au')).toBe(CONSTANTS.AU_M);
  });

  it('2 Earth radii', () => {
    expect(toMetres(2, 'earth_radius')).toBe(2 * CONSTANTS.EARTH_RADIUS_M);
  });

  it('0 m → 0', () => {
    expect(toMetres(0, 'm')).toBe(0);
  });

  it('10 km → 10000 m', () => {
    expect(toMetres(10, 'km')).toBe(10000);
  });

  it('0.5 AU', () => {
    expect(toMetres(0.5, 'au')).toBe(0.5 * CONSTANTS.AU_M);
  });
});
