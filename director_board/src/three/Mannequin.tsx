import { useCallback, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { TransformControls } from '@react-three/drei';
import type { Character } from '../types';
import { POSES, type Euler3, type JointName } from '../data/poses';
import { useSceneStore } from '../store/useSceneStore';

// Figure proportions (world units ~= meters); feet sit at the group origin.
const HIP_Y = 0.9;
const SHOULDER_OFF = 0.55; // above hips
const HEAD_OFF = 0.62;
const SHOULDER_X = 0.19;
const HIP_X = 0.11;
const UPPER_ARM = 0.28;
const FORE_ARM = 0.26;
const THIGH = 0.45;
const SHIN = 0.45;
const LIMB_R = 0.058;

interface BoneProps {
  len: number;
  radius: number;
  color: THREE.ColorRepresentation;
  z?: number;
}

/** A capsule extending downward from the parent joint pivot. */
function Bone({ len, radius, color, z = 0 }: BoneProps) {
  return (
    <mesh position={[0, -len / 2, z]} castShadow>
      <capsuleGeometry args={[radius, Math.max(len - 2 * radius, 0.02), 4, 10]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.05} />
    </mesh>
  );
}

interface Props {
  character: Character;
}

export function Mannequin({ character }: Props) {
  const ref = useRef<THREE.Group | null>(null);
  const [obj, setObj] = useState<THREE.Group | null>(null);
  const lastScale = useRef(character.scale);

  // a stable callback ref so the gizmo can attach once the group mounts
  const setGroup = useCallback((g: THREE.Group | null) => {
    ref.current = g;
    setObj(g);
  }, []);

  const selectedId = useSceneStore((s) => s.selectedId);
  const transformMode = useSceneStore((s) => s.transformMode);
  const selectCharacter = useSceneStore((s) => s.selectCharacter);
  const updateCharacter = useSceneStore((s) => s.updateCharacter);
  const selected = selectedId === character.id;

  // keep the uniform-scale baseline in sync with external edits (e.g. slider)
  lastScale.current = character.scale;

  const pose = POSES[character.pose];
  const j = (name: JointName): Euler3 => pose.joints[name] ?? [0, 0, 0];

  const colors = useMemo(() => {
    const base = new THREE.Color(character.color);
    const head = base.clone().lerp(new THREE.Color('#ffffff'), 0.25);
    const joint = base.clone().multiplyScalar(0.6);
    return { base, head, joint };
  }, [character.color]);

  const handleChange = () => {
    const o = ref.current;
    if (!o) return;
    if (transformMode === 'translate') {
      updateCharacter(character.id, { position: [o.position.x, o.position.y, o.position.z] });
    } else if (transformMode === 'rotate') {
      updateCharacter(character.id, { rotation: [o.rotation.x, o.rotation.y, o.rotation.z] });
    } else {
      // uniform scale: the axis being dragged moves furthest from the prior value
      const prev = lastScale.current;
      let v = prev;
      for (const c of [o.scale.x, o.scale.y, o.scale.z]) {
        if (Math.abs(c - prev) > Math.abs(v - prev)) v = c;
      }
      v = THREE.MathUtils.clamp(v, 0.2, 4);
      o.scale.set(v, v, v);
      lastScale.current = v;
      updateCharacter(character.id, { scale: v });
    }
  };

  return (
    <>
      <group
        ref={setGroup}
        position={character.position}
        rotation={character.rotation}
        scale={character.scale}
        onClick={(e) => {
          e.stopPropagation();
          selectCharacter(character.id);
        }}
      >
        {/* pose body tilt about the feet (e.g. lying flat) */}
        <group rotation={pose.rootRotation ?? [0, 0, 0]}>
          {/* pose vertical offset (e.g. seated figures sit lower) */}
          <group position={[0, pose.rootY, 0]}>
            {/* hips anchor */}
            <group position={[0, HIP_Y, 0]}>
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.34, 0.2, 0.2]} />
              <meshStandardMaterial color={colors.joint} roughness={0.7} />
            </mesh>

            {/* ===== upper body (rotates at the hips) ===== */}
            <group rotation={j('torso')}>
              <mesh position={[0, 0.28, 0]} castShadow>
                <capsuleGeometry args={[0.16, 0.34, 6, 14]} />
                <meshStandardMaterial color={colors.base} roughness={0.7} metalness={0.05} />
              </mesh>

              {/* head */}
              <group position={[0, HEAD_OFF, 0]} rotation={j('head')}>
                <mesh position={[0, 0.14, 0]} castShadow>
                  <sphereGeometry args={[0.135, 20, 16]} />
                  <meshStandardMaterial color={colors.head} roughness={0.6} />
                </mesh>
              </group>

              {/* left arm */}
              <group position={[SHOULDER_X, SHOULDER_OFF, 0]} rotation={j('lShoulder')}>
                <Bone len={UPPER_ARM} radius={LIMB_R} color={colors.base} />
                <group position={[0, -UPPER_ARM, 0]} rotation={j('lElbow')}>
                  <Bone len={FORE_ARM} radius={LIMB_R * 0.9} color={colors.base} />
                  <mesh position={[0, -FORE_ARM, 0]} castShadow>
                    <sphereGeometry args={[0.05, 12, 10]} />
                    <meshStandardMaterial color={colors.joint} roughness={0.7} />
                  </mesh>
                </group>
              </group>

              {/* right arm */}
              <group position={[-SHOULDER_X, SHOULDER_OFF, 0]} rotation={j('rShoulder')}>
                <Bone len={UPPER_ARM} radius={LIMB_R} color={colors.base} />
                <group position={[0, -UPPER_ARM, 0]} rotation={j('rElbow')}>
                  <Bone len={FORE_ARM} radius={LIMB_R * 0.9} color={colors.base} />
                  <mesh position={[0, -FORE_ARM, 0]} castShadow>
                    <sphereGeometry args={[0.05, 12, 10]} />
                    <meshStandardMaterial color={colors.joint} roughness={0.7} />
                  </mesh>
                </group>
              </group>
            </group>

            {/* ===== legs (rotate at the hips) ===== */}
            <group position={[HIP_X, 0, 0]} rotation={j('lHip')}>
              <Bone len={THIGH} radius={LIMB_R * 1.2} color={colors.base} />
              <group position={[0, -THIGH, 0]} rotation={j('lKnee')}>
                <Bone len={SHIN} radius={LIMB_R} color={colors.base} />
                <mesh position={[0, -SHIN, 0.06]} castShadow>
                  <boxGeometry args={[0.1, 0.06, 0.22]} />
                  <meshStandardMaterial color={colors.joint} roughness={0.7} />
                </mesh>
              </group>
            </group>

            <group position={[-HIP_X, 0, 0]} rotation={j('rHip')}>
              <Bone len={THIGH} radius={LIMB_R * 1.2} color={colors.base} />
              <group position={[0, -THIGH, 0]} rotation={j('rKnee')}>
                <Bone len={SHIN} radius={LIMB_R} color={colors.base} />
                <mesh position={[0, -SHIN, 0.06]} castShadow>
                  <boxGeometry args={[0.1, 0.06, 0.22]} />
                  <meshStandardMaterial color={colors.joint} roughness={0.7} />
                </mesh>
              </group>
            </group>
          </group>

          </group>
        </group>
      </group>

      {selected && obj && (
        <TransformControls
          object={obj}
          mode={transformMode}
          space="world"
          showX
          showY={transformMode !== 'translate'}
          showZ
          onObjectChange={handleChange}
        />
      )}
    </>
  );
}
