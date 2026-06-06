import { useRef, type ChangeEvent, type RefObject } from 'react';
import { useSceneStore } from '../store/useSceneStore';
import { downloadUrl, downloadJson } from '../lib/exporter';
import { serializeProject, parseProject } from '../lib/project';
import type { TransformMode } from '../types';

interface Props {
  captureRef: RefObject<(() => string) | null>;
}

const MODE_LABELS: Record<TransformMode, string> = {
  translate: 'Move',
  rotate: 'Rotate',
  scale: 'Scale',
};
const MODES: TransformMode[] = ['translate', 'rotate', 'scale'];

export function Toolbar({ captureRef }: Props) {
  const addCharacter = useSceneStore((s) => s.addCharacter);
  const setPanorama = useSceneStore((s) => s.setPanorama);
  const transformMode = useSceneStore((s) => s.transformMode);
  const setTransformMode = useSceneStore((s) => s.setTransformMode);
  const loadProject = useSceneStore((s) => s.loadProject);
  const showGrid = useSceneStore((s) => s.showGrid);
  const setShowGrid = useSceneStore((s) => s.setShowGrid);

  const imgInput = useRef<HTMLInputElement>(null);
  const projInput = useRef<HTMLInputElement>(null);

  const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPanorama({ kind: 'upload', dataUrl: String(reader.result) });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const onExport = () => {
    const url = captureRef.current?.();
    if (url) downloadUrl(url, 'director-frame.png');
  };

  const onSave = () => {
    downloadJson(serializeProject(useSceneStore.getState()), 'director-project.json');
  };

  const onLoadProject = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        loadProject(parseProject(JSON.parse(String(reader.result))));
      } catch (err) {
        alert('Invalid project file: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="toolbar">
      <span className="brand">🎬 Director Board</span>
      <button className="btn" data-testid="upload" onClick={() => imgInput.current?.click()}>
        Upload panorama
      </button>
      <button className="btn" data-testid="load-example" onClick={() => setPanorama({ kind: 'example' })}>
        Load example
      </button>
      <button className="btn primary" data-testid="add-character" onClick={() => addCharacter()}>
        + Add character
      </button>

      <div className="seg" data-testid="transform-mode">
        {MODES.map((m) => (
          <button
            key={m}
            className={transformMode === m ? 'active' : ''}
            data-testid={`mode-${m}`}
            onClick={() => setTransformMode(m)}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      <label className="btn" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
        <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
        Grid
      </label>

      <span className="spacer" />

      <button className="btn" data-testid="export-png" onClick={onExport}>
        Export PNG
      </button>
      <button className="btn" data-testid="save-project" onClick={onSave}>
        Save
      </button>
      <button className="btn" data-testid="load-project" onClick={() => projInput.current?.click()}>
        Load
      </button>

      <input ref={imgInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={onUpload} />
      <input
        ref={projInput}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={onLoadProject}
      />
    </div>
  );
}
