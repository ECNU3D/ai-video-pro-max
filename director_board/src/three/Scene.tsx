import { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { PanoramaSphere } from './PanoramaSphere';
import { Mannequin } from './Mannequin';
import { FovZoom } from './FovZoom';
import { useSceneStore } from '../store/useSceneStore';
import { capturePng } from '../lib/exporter';

interface Props {
  panoramaSrc: string | null;
  registerCapture: (fn: (() => string) | null) => void;
}

/** Viewer eye height above the floor (floor and figures sit at y = 0). */
const EYE_Y = 1.6;

/** OrbitControls anchored at the sphere center; writes camera angles to the store. */
function LookControls() {
  // drei forwards a three-stdlib OrbitControls impl; typed loosely to avoid a hard import
  const ref = useRef<{ getAzimuthalAngle(): number; getPolarAngle(): number } | null>(null);
  const setCamera = useSceneStore((s) => s.setCamera);
  return (
    <OrbitControls
      // @ts-expect-error drei ref type vs. our minimal shape
      ref={ref}
      makeDefault
      enablePan={false}
      enableZoom={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={-0.4}
      target={[0, EYE_Y, 0]}
      onEnd={() => {
        const c = ref.current;
        if (c) setCamera({ azimuth: c.getAzimuthalAngle(), polar: c.getPolarAngle() });
      }}
    />
  );
}

/** Re-applies stored camera state to the live camera whenever a project loads. */
function CameraRig() {
  const controls = useThree((s) => s.controls) as
    | { setAzimuthalAngle?(a: number): void; setPolarAngle?(a: number): void; update?(): void }
    | null;
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const cam = useSceneStore((s) => s.camera);
  const loadNonce = useSceneStore((s) => s.loadNonce);

  useEffect(() => {
    if (controls?.setAzimuthalAngle) {
      controls.setAzimuthalAngle(cam.azimuth);
      controls.setPolarAngle?.(cam.polar);
      controls.update?.();
    }
    camera.fov = cam.fov;
    camera.updateProjectionMatrix();
    // only re-apply on explicit project load, not on every camera tweak
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadNonce]);

  return null;
}

/** Exposes a PNG capture function (with access to gl/scene/camera) to the UI. */
function CaptureBridge({ register }: { register: (fn: (() => string) | null) => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    register(() => capturePng(gl, scene, camera));
    return () => register(null);
  }, [gl, scene, camera, register]);
  return null;
}

/** Flat ring on the floor under the selected character (hidden on export). */
function SelectionRing() {
  const characters = useSceneStore((s) => s.characters);
  const selectedId = useSceneStore((s) => s.selectedId);
  const sel = characters.find((c) => c.id === selectedId);
  if (!sel) return null;
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[sel.position[0], 0.02, sel.position[2]]}
      userData={{ excludeFromCapture: true }}
    >
      <ringGeometry args={[0.5, 0.62, 48]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.85} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function Scene({ panoramaSrc, registerCapture }: Props) {
  const characters = useSceneStore((s) => s.characters);
  const showGrid = useSceneStore((s) => s.showGrid);
  const selectCharacter = useSceneStore((s) => s.selectCharacter);

  return (
    <Canvas
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      camera={{ position: [0, EYE_Y, 0.1], fov: 75, near: 0.01, far: 1000 }}
      dpr={[1, 2]}
      onPointerMissed={() => selectCharacter(null)}
    >
      <hemisphereLight args={['#ffffff', '#3a3a44', 1.1]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 12, 4]} intensity={1.1} />

      <PanoramaSphere src={panoramaSrc} />

      {showGrid && (
        <group userData={{ excludeFromCapture: true }}>
          <Grid
            position={[0, 0, 0]}
            args={[60, 60]}
            cellSize={1}
            cellThickness={0.6}
            sectionSize={5}
            sectionThickness={1}
            cellColor="#6b7280"
            sectionColor="#9aa3af"
            fadeDistance={48}
            fadeStrength={1.2}
            infiniteGrid
          />
        </group>
      )}

      {characters.map((c) => (
        <Mannequin key={c.id} character={c} />
      ))}
      <SelectionRing />

      <LookControls />
      <CameraRig />
      <FovZoom />
      <CaptureBridge register={registerCapture} />
    </Canvas>
  );
}
