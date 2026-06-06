import { describe, it, expect } from 'vitest';
import { serializeProject, parseProject } from '../src/lib/project';
import type { Character } from '../src/types';

const sampleCharacter: Character = {
  id: 'c-1',
  name: 'Character 1',
  color: '#e6194b',
  pose: 'sitting',
  position: [1, 0, -3],
  rotation: [0, 0.5, 0],
  scale: 1.2,
};

const state = {
  panorama: { kind: 'upload' as const, dataUrl: 'data:image/png;base64,AAAA' },
  characters: [sampleCharacter],
  camera: { azimuth: 0.1, polar: 1.4, fov: 60 },
};

describe('project serialize/parse', () => {
  it('round-trips through JSON', () => {
    const file = serializeProject(state);
    const restored = parseProject(JSON.parse(JSON.stringify(file)));
    expect(restored).toEqual(file);
    expect(restored.characters[0]).toEqual(sampleCharacter);
  });

  it('rejects an empty object', () => {
    expect(() => parseProject({})).toThrow();
  });

  it('rejects an unsupported version', () => {
    expect(() => parseProject({ version: 2, characters: [], camera: {} })).toThrow();
  });

  it('migrates a legacy rotationY into the rotation array', () => {
    const legacy = {
      version: 1,
      panorama: null,
      camera: { azimuth: 0, polar: 1, fov: 75 },
      characters: [
        { id: 'c-1', name: 'X', color: '#fff', pose: 'standing', position: [0, 0, 0], rotationY: 0.7, scale: 1 },
      ],
    };
    expect(parseProject(legacy).characters[0].rotation).toEqual([0, 0.7, 0]);
  });

  it('rejects a character with an invalid pose', () => {
    const bad = {
      version: 1,
      panorama: null,
      camera: { azimuth: 0, polar: 1, fov: 75 },
      characters: [{ ...sampleCharacter, pose: 'flying' }],
    };
    expect(() => parseProject(bad)).toThrow();
  });
});
