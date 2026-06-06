import { useEffect, useState } from 'react';
import * as THREE from 'three';

interface Props {
  /** Image URL: a data URL for uploads, or `/example.png`. */
  src: string | null;
}

/**
 * A large sphere viewed from the inside, textured with an equirectangular
 * panorama. Geometry is mirrored on X (scale -1) so normals face inward and
 * the texture reads the correct way round from the center.
 */
export function PanoramaSphere({ src }: Props) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!src) {
      setTexture(null);
      return;
    }
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(src, (tex) => {
      if (cancelled) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      // viewed from inside (BackSide) the texture is mirrored; flip X to correct
      tex.wrapS = THREE.RepeatWrapping;
      tex.repeat.x = -1;
      tex.offset.x = 1;
      setTexture(tex);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  // dispose the previous texture when it changes / unmounts
  useEffect(() => () => texture?.dispose(), [texture]);

  if (!texture) return null;

  return (
    <mesh renderOrder={-1}>
      <sphereGeometry args={[100, 64, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}
