import type { PoseName } from '../types';

export type JointName =
  | 'torso'
  | 'head'
  | 'lShoulder'
  | 'lElbow'
  | 'rShoulder'
  | 'rElbow'
  | 'lHip'
  | 'lKnee'
  | 'rHip'
  | 'rKnee';

export const JOINT_NAMES: JointName[] = [
  'torso',
  'head',
  'lShoulder',
  'lElbow',
  'rShoulder',
  'rElbow',
  'lHip',
  'lKnee',
  'rHip',
  'rKnee',
];

/** Euler rotation [x, y, z] in radians applied to a joint group. */
export type Euler3 = [number, number, number];

export interface Pose {
  /** Vertical offset of the whole figure (negative = lowered, e.g. seated). */
  rootY: number;
  /**
   * Rigid rotation of the whole figure about its feet, applied beneath the
   * user's transform. Used to tip the body horizontal for `lying`.
   */
  rootRotation?: Euler3;
  /** Rotation per joint; omitted joints default to [0,0,0]. */
  joints: Partial<Record<JointName, Euler3>>;
}

const HALF_PI = Math.PI / 2;

/**
 * Rest pose convention: torso vertical, arms hanging straight down at the
 * sides, legs straight down, feet at the figure origin (y = 0).
 * Positive X rotation on a hip/shoulder swings that limb forward (+Z).
 */
export const POSES: Record<PoseName, Pose> = {
  standing: {
    rootY: 0,
    joints: {
      // arms relaxed slightly away from the body
      lShoulder: [0, 0, 0.14],
      rShoulder: [0, 0, -0.14],
    },
  },

  sitting: {
    // seat height ~0.45 below standing hip so feet rest on the floor
    rootY: -0.45,
    joints: {
      lHip: [-HALF_PI, 0, 0], // thighs swing forward to horizontal
      rHip: [-HALF_PI, 0, 0],
      lKnee: [HALF_PI, 0, 0], // shins drop back to vertical
      rKnee: [HALF_PI, 0, 0],
      lShoulder: [0, 0, 0.1],
      rShoulder: [0, 0, -0.1],
      lElbow: [-0.5, 0, 0], // forearms rest forward on the lap
      rElbow: [-0.5, 0, 0],
    },
  },

  walking: {
    rootY: -0.04,
    joints: {
      lHip: [0.45, 0, 0], // left leg forward
      rHip: [-0.45, 0, 0], // right leg back
      lKnee: [0.2, 0, 0],
      rKnee: [0.5, 0, 0],
      lShoulder: [-0.5, 0, 0.12], // arms swing opposite the legs
      rShoulder: [0.5, 0, -0.12],
      lElbow: [-0.4, 0, 0],
      rElbow: [-0.4, 0, 0],
      torso: [0.05, 0, 0],
    },
  },

  crouching: {
    rootY: -0.42,
    joints: {
      torso: [0.25, 0, 0], // lean forward
      lHip: [-0.6, 0, 0],
      rHip: [-0.6, 0, 0],
      lKnee: [1.1, 0, 0], // deep knee bend
      rKnee: [1.1, 0, 0],
      lShoulder: [-0.6, 0, 0.15],
      rShoulder: [-0.6, 0, -0.15],
      lElbow: [-0.4, 0, 0],
      rElbow: [-0.4, 0, 0],
    },
  },

  pointing: {
    rootY: 0,
    joints: {
      rShoulder: [-HALF_PI, 0, -0.1], // right arm raised forward, level
      rElbow: [0, 0, 0],
      lShoulder: [0, 0, 0.14],
    },
  },

  'arms-raised': {
    rootY: 0,
    joints: {
      lShoulder: [0, 0, 2.8], // both arms up overhead
      rShoulder: [0, 0, -2.8],
      lElbow: [0, 0, 0],
      rElbow: [0, 0, 0],
    },
  },

  lying: {
    // tip the whole body backward to horizontal (supine, face up); the feet
    // stay near the origin, head extends away. Lift slightly so the back of
    // the body rests on the floor rather than sinking into it.
    rootY: 0.18,
    rootRotation: [-HALF_PI, 0, 0],
    joints: {
      lShoulder: [0, 0, 0.5], // arms relaxed a little away from the torso
      rShoulder: [0, 0, -0.5],
      lHip: [0, 0, 0.08], // legs slightly apart
      rHip: [0, 0, -0.08],
    },
  },
};
