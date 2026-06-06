import { create } from 'zustand';
import type {
  Character,
  CameraState,
  PanoramaRef,
  ProjectFile,
  TransformMode,
} from '../types';
import { colorForIndex } from '../data/palette';

let counter = 0;

const DEFAULT_CAMERA: CameraState = { azimuth: 0, polar: Math.PI / 2, fov: 75 };

export interface SceneState {
  characters: Character[];
  selectedId: string | null;
  transformMode: TransformMode;
  panorama: PanoramaRef | null;
  showGrid: boolean;
  camera: CameraState;
  /** Bumped on loadProject so the 3D camera rig re-applies camera state. */
  loadNonce: number;

  addCharacter: () => string;
  removeCharacter: (id: string) => void;
  selectCharacter: (id: string | null) => void;
  updateCharacter: (id: string, patch: Partial<Character>) => void;
  setTransformMode: (mode: TransformMode) => void;
  setPanorama: (panorama: PanoramaRef | null) => void;
  setShowGrid: (value: boolean) => void;
  setCamera: (patch: Partial<CameraState>) => void;
  loadProject: (project: ProjectFile) => void;
  reset: () => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  characters: [],
  selectedId: null,
  transformMode: 'translate',
  panorama: null,
  showGrid: true,
  camera: { ...DEFAULT_CAMERA },
  loadNonce: 0,

  addCharacter: () => {
    const n = ++counter;
    const id = `c-${n}`;
    set((s) => {
      // spawn new characters in a visible row in front of the camera
      const i = s.characters.length;
      const xOffsets = [0, 1.4, -1.4, 2.8, -2.8];
      const character: Character = {
        id,
        name: `Character ${n}`,
        color: colorForIndex(n - 1),
        pose: 'standing',
        position: [xOffsets[i % xOffsets.length], 0, -3.5 - Math.floor(i / xOffsets.length) * 1.6],
        rotation: [0, 0, 0],
        scale: 1,
      };
      return { characters: [...s.characters, character], selectedId: id };
    });
    return id;
  },

  removeCharacter: (id) =>
    set((s) => ({
      characters: s.characters.filter((c) => c.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  selectCharacter: (id) => set({ selectedId: id }),

  updateCharacter: (id, patch) =>
    set((s) => ({
      characters: s.characters.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),

  setTransformMode: (mode) => set({ transformMode: mode }),

  setPanorama: (panorama) => set({ panorama }),

  setShowGrid: (value) => set({ showGrid: value }),

  setCamera: (patch) => set((s) => ({ camera: { ...s.camera, ...patch } })),

  loadProject: (project) => {
    // keep the id counter ahead of any ids restored from the file
    for (const c of project.characters) {
      const m = /^c-(\d+)$/.exec(c.id);
      if (m) counter = Math.max(counter, Number(m[1]));
    }
    set((s) => ({
      characters: project.characters.map((c) => ({ ...c })),
      panorama: project.panorama,
      camera: { ...project.camera },
      selectedId: null,
      loadNonce: s.loadNonce + 1,
    }));
  },

  reset: () => {
    counter = 0;
    set({
      characters: [],
      selectedId: null,
      transformMode: 'translate',
      panorama: null,
      showGrid: true,
      camera: { ...DEFAULT_CAMERA },
    });
  },
}));
