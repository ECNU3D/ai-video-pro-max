import { describe, it, expect } from 'vitest';
import { POSES, JOINT_NAMES } from '../src/data/poses';
import { POSE_NAMES } from '../src/types';

describe('poses', () => {
  it('defines every pose name', () => {
    for (const name of POSE_NAMES) {
      expect(POSES[name]).toBeDefined();
    }
  });

  it('standing is upright with near-zero, non-lowered root', () => {
    const standing = POSES.standing;
    expect(standing.rootY).toBe(0);
    // no large joint bends in a standing pose
    for (const name of JOINT_NAMES) {
      const rot = standing.joints[name];
      if (!rot) continue;
      for (const a of rot) expect(Math.abs(a)).toBeLessThan(0.5);
    }
  });

  it('sitting lowers the root and bends the hips', () => {
    const sitting = POSES.sitting;
    expect(sitting.rootY).toBeLessThan(0);
    expect(sitting.joints.lHip).toBeDefined();
    expect(Math.abs(sitting.joints.lHip![0])).toBeGreaterThan(1); // ~90 deg
  });

  it('crouching lowers the root', () => {
    expect(POSES.crouching.rootY).toBeLessThan(0);
  });

  it('lying tips the whole body roughly horizontal', () => {
    const lying = POSES.lying;
    expect(lying.rootRotation).toBeDefined();
    expect(Math.abs(lying.rootRotation![0])).toBeGreaterThan(1); // ~90 deg tip
  });
});
