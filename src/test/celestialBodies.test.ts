import { describe, it, expect } from 'vitest';
import { celestialBodies } from '../data/celestialBodies';

describe('celestialBodies data', () => {
  it('contains at least 8 solar-system planets', () => {
    const planets = celestialBodies.filter((b) => b.category === 'planet');
    expect(planets.length).toBeGreaterThanOrEqual(8);
  });

  it('Earth has a gravity multiplier of 1.0', () => {
    const earth = celestialBodies.find((b) => b.id === 'earth');
    expect(earth).toBeDefined();
    expect(earth!.gravityMultiplier).toBe(1.0);
  });

  it('every body has a unique id', () => {
    const ids = celestialBodies.map((b) => b.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('physical bodies have valid gravity multipliers', () => {
    const physicalBodies = celestialBodies.filter(
      (b) => !['anti_gravity'].includes(b.category)
    );
    physicalBodies.forEach((body) => {
      expect(body.gravityMultiplier).toBeGreaterThanOrEqual(0);
    });
  });

  it('total body count exceeds 40', () => {
    expect(celestialBodies.length).toBeGreaterThan(40);
  });
});
