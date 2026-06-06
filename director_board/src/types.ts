export type TransformMode = 'translate' | 'rotate' | 'scale';

export type PoseName =
  | 'standing'
  | 'sitting'
  | 'walking'
  | 'crouching'
  | 'pointing'
  | 'arms-raised'
  | 'lying';

export const POSE_NAMES: PoseName[] = [
  'standing',
  'sitting',
  'walking',
  'crouching',
  'pointing',
  'arms-raised',
  'lying',
];

export interface Character {
  id: string;
  name: string;
  color: string;
  pose: PoseName;
  /** World position; y is height above the floor (0 = on the ground). */
  position: [number, number, number];
  /** Full orientation as Euler angles [pitch, yaw, roll] in radians. */
  rotation: [number, number, number];
  /** Uniform scale used to match apparent depth/size. */
  scale: number;
}

export interface PanoramaRef {
  kind: 'example' | 'upload';
  /** Data URL when kind === 'upload'. */
  dataUrl?: string;
}

export interface CameraState {
  /** OrbitControls azimuth angle (radians). */
  azimuth: number;
  /** OrbitControls polar angle (radians). */
  polar: number;
  /** Perspective field of view (degrees). */
  fov: number;
}

export interface ProjectFile {
  version: 1;
  panorama: PanoramaRef | null;
  characters: Character[];
  camera: CameraState;
}
