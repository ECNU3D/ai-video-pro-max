import { describe, it, expect, beforeEach } from 'vitest';
import { useSceneStore } from '../src/store/useSceneStore';
import type { ProjectFile } from '../src/types';

const get = () => useSceneStore.getState();

beforeEach(() => {
  get().reset();
});

describe('useSceneStore', () => {
  it('adds characters with distinct colors and selects the new one', () => {
    const id1 = get().addCharacter();
    const id2 = get().addCharacter();
    const chars = get().characters;
    expect(chars).toHaveLength(2);
    expect(chars[0].color).not.toBe(chars[1].color);
    expect(get().selectedId).toBe(id2);
    expect(id1).not.toBe(id2);
  });

  it('removes a character and clears selection when it was selected', () => {
    const id = get().addCharacter();
    expect(get().selectedId).toBe(id);
    get().removeCharacter(id);
    expect(get().characters).toHaveLength(0);
    expect(get().selectedId).toBeNull();
  });

  it('merges a patch into a character', () => {
    const id = get().addCharacter();
    get().updateCharacter(id, { pose: 'sitting', scale: 2 });
    const c = get().characters[0];
    expect(c.pose).toBe('sitting');
    expect(c.scale).toBe(2);
    expect(c.id).toBe(id); // other fields preserved
  });

  it('loads a project, replacing characters and panorama', () => {
    get().addCharacter();
    const project: ProjectFile = {
      version: 1,
      panorama: { kind: 'example' },
      camera: { azimuth: 1, polar: 1, fov: 50 },
      characters: [
        {
          id: 'c-7',
          name: 'Loaded',
          color: '#3cb44b',
          pose: 'walking',
          position: [0, 0, -2],
          rotation: [0, 0, 0],
          scale: 1,
        },
      ],
    };
    get().loadProject(project);
    expect(get().characters).toHaveLength(1);
    expect(get().characters[0].name).toBe('Loaded');
    expect(get().panorama).toEqual({ kind: 'example' });
    expect(get().camera.fov).toBe(50);
    // counter advanced past loaded id, so the next add does not collide
    const newId = get().addCharacter();
    expect(newId).not.toBe('c-7');
  });
});
