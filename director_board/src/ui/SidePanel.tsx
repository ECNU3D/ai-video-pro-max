import { useSceneStore } from '../store/useSceneStore';
import { POSE_NAMES, type PoseName } from '../types';

export function SidePanel() {
  const characters = useSceneStore((s) => s.characters);
  const selectedId = useSceneStore((s) => s.selectedId);
  const selectCharacter = useSceneStore((s) => s.selectCharacter);
  const removeCharacter = useSceneStore((s) => s.removeCharacter);
  const updateCharacter = useSceneStore((s) => s.updateCharacter);

  const selected = characters.find((c) => c.id === selectedId) ?? null;

  const deg = (r: number) => Math.round((r * 180) / Math.PI);
  const setRotAxis = (axis: 0 | 1 | 2, value: number) => {
    if (!selected) return;
    const r: [number, number, number] = [...selected.rotation];
    r[axis] = value;
    updateCharacter(selected.id, { rotation: r });
  };
  const setHeight = (value: number) => {
    if (!selected) return;
    updateCharacter(selected.id, { position: [selected.position[0], value, selected.position[2]] });
  };

  return (
    <div className="side-panel">
      <div>
        <div className="section-title">Characters ({characters.length})</div>
        {characters.length === 0 ? (
          <div className="empty">No characters yet. Click “+ Add character”.</div>
        ) : (
          <div className="char-list" data-testid="char-list">
            {characters.map((c) => (
              <div
                key={c.id}
                className={`char-row ${c.id === selectedId ? 'selected' : ''}`}
                data-testid={`char-row-${c.id}`}
                onClick={() => selectCharacter(c.id)}
              >
                <span className="swatch" data-testid={`swatch-${c.id}`} style={{ background: c.color }} />
                <span className="name">{c.name}</span>
                <button
                  className="del"
                  title="Delete"
                  data-testid={`delete-${c.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCharacter(c.id);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div data-testid="inspector">
          <div className="section-title">Selected · {selected.name}</div>

          <div className="field">
            <label>Pose</label>
            <select
              data-testid="pose-select"
              value={selected.pose}
              onChange={(e) => updateCharacter(selected.id, { pose: e.target.value as PoseName })}
            >
              {POSE_NAMES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Color</label>
            <input
              type="color"
              data-testid="color-input"
              value={selected.color}
              onChange={(e) => updateCharacter(selected.id, { color: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Size ({selected.scale.toFixed(2)}×)</label>
            <input
              type="range"
              min={0.3}
              max={3}
              step={0.05}
              data-testid="size-input"
              value={selected.scale}
              onChange={(e) => updateCharacter(selected.id, { scale: Number(e.target.value) })}
            />
          </div>

          <div className="field">
            <label>Height ({selected.position[1].toFixed(2)} m)</label>
            <input
              type="range"
              min={0}
              max={3}
              step={0.02}
              data-testid="height-input"
              value={selected.position[1]}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </div>

          <div className="field">
            <label>Facing / yaw ({deg(selected.rotation[1])}°)</label>
            <input
              type="range"
              min={-Math.PI}
              max={Math.PI}
              step={0.02}
              data-testid="yaw-input"
              value={selected.rotation[1]}
              onChange={(e) => setRotAxis(1, Number(e.target.value))}
            />
          </div>

          <div className="field">
            <label>Tilt / pitch ({deg(selected.rotation[0])}°)</label>
            <input
              type="range"
              min={-Math.PI}
              max={Math.PI}
              step={0.02}
              data-testid="pitch-input"
              value={selected.rotation[0]}
              onChange={(e) => setRotAxis(0, Number(e.target.value))}
            />
          </div>

          <div className="field">
            <label>Roll ({deg(selected.rotation[2])}°)</label>
            <input
              type="range"
              min={-Math.PI}
              max={Math.PI}
              step={0.02}
              data-testid="roll-input"
              value={selected.rotation[2]}
              onChange={(e) => setRotAxis(2, Number(e.target.value))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
