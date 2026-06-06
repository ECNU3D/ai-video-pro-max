import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../store/useSceneStore';

/** Mouse wheel adjusts the perspective FOV — panoramic zoom, not a dolly. */
export function FovZoom() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const gl = useThree((s) => s.gl);
  const setCamera = useSceneStore((s) => s.setCamera);

  useEffect(() => {
    const el = gl.domElement;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = THREE.MathUtils.clamp(camera.fov + e.deltaY * 0.04, 20, 90);
      camera.fov = next;
      camera.updateProjectionMatrix();
      setCamera({ fov: next });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [camera, gl, setCamera]);

  return null;
}
