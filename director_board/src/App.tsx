import { useCallback, useEffect, useRef } from 'react';
import { Scene } from './three/Scene';
import { Toolbar } from './ui/Toolbar';
import { SidePanel } from './ui/SidePanel';
import { useSceneStore } from './store/useSceneStore';

export default function App() {
  const panorama = useSceneStore((s) => s.panorama);
  const setPanorama = useSceneStore((s) => s.setPanorama);

  const captureRef = useRef<(() => string) | null>(null);
  const registerCapture = useCallback((fn: (() => string) | null) => {
    captureRef.current = fn;
  }, []);

  // load the bundled example panorama on first run
  useEffect(() => {
    if (!useSceneStore.getState().panorama) {
      setPanorama({ kind: 'example' });
    }
  }, [setPanorama]);

  const panoramaSrc =
    panorama == null
      ? null
      : panorama.kind === 'example'
        ? '/example.png'
        : (panorama.dataUrl ?? null);

  return (
    <div className="app">
      <Toolbar captureRef={captureRef} />
      <div className="main">
        <div className="canvas-wrap">
          <Scene panoramaSrc={panoramaSrc} registerCapture={registerCapture} />
          <div className="hint">
            Drag = look around · Wheel = zoom · Click a puppet to select · Gizmo = move / rotate / scale
          </div>
        </div>
        <SidePanel />
      </div>
    </div>
  );
}
