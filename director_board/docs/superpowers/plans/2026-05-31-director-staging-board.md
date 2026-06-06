# Director Staging Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A local web app to load a 360° panorama, place colored posable 3D mannequin puppets, frame a shot, and export a flat PNG + a re-loadable JSON project.

**Architecture:** Vite + React 19 + TypeScript front end. A single R3F `<Canvas>` renders an inside-out panorama sphere, a ground grid, lights, and N procedural mannequins. Camera is anchored at the sphere center; drei `OrbitControls` rotates the view, the wheel changes FOV. Selecting a mannequin attaches drei `TransformControls` (move/rotate/scale), which auto-disables orbit during drag. A zustand store holds characters + selection + scene settings. Pure logic (poses, palette, project serialize) is unit-tested with Vitest; the integrated app is smoke-tested with Playwright (headless WebGL) plus screenshot inspection.

**Tech Stack:** Vite, React 19, TypeScript, three.js r165+, @react-three/fiber v9, @react-three/drei, zustand, Vitest, Playwright.

---

## File Structure

```
director_board/
  package.json, tsconfig*.json, vite.config.ts, index.html, .gitignore
  public/example.png                  # copy of the sample panorama
  src/
    main.tsx                          # React entry
    App.tsx                           # layout shell: toolbar + side panel + canvas
    styles.css
    types.ts                          # Character, PoseName, ProjectFile, TransformMode
    store/useSceneStore.ts            # zustand store + actions
    data/palette.ts                   # distinct character colors
    data/poses.ts                     # pose name -> joint rotation map
    three/Scene.tsx                   # Canvas contents: camera, controls, grid, lights, mannequins, transform
    three/PanoramaSphere.tsx          # inside-out textured sphere
    three/Mannequin.tsx               # procedural posable figure
    three/FovZoom.tsx                 # wheel -> camera FOV controller
    lib/project.ts                    # serialize/deserialize project, pure
    lib/exporter.ts                   # PNG capture + file download helpers
    ui/Toolbar.tsx
    ui/SidePanel.tsx
  tests/                              # Vitest unit tests
    palette.test.ts, poses.test.ts, project.test.ts, store.test.ts
  e2e/smoke.spec.ts                   # Playwright
  playwright.config.ts
```

---

## Task 1: Scaffold project

**Files:** Create `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `.gitignore`. Copy `example.png` -> `public/example.png`.

- [ ] Init Vite React-TS app, install: `three @react-three/fiber @react-three/drei zustand`; dev: `vitest @vitest/coverage-v8 jsdom @playwright/test typescript @types/three`.
- [ ] vite.config.ts enables `test` (vitest, jsdom env) and the React plugin.
- [ ] `App.tsx` renders a flex layout: `<Toolbar/>`, main `<Scene/>` area, `<SidePanel/>` (stubs ok this task).
- [ ] Copy example panorama into `public/`.
- [ ] Verify: `npm run dev` serves; `npm run build` passes. Commit.

## Task 2: Types + store (TDD)

**Files:** Create `src/types.ts`, `src/store/useSceneStore.ts`, `tests/store.test.ts`.

Types:
```ts
export type TransformMode = 'translate' | 'rotate' | 'scale';
export type PoseName = 'standing' | 'sitting' | 'walking' | 'crouching' | 'pointing' | 'arms-raised';
export interface Character {
  id: string; name: string; color: string; pose: PoseName;
  position: [number, number, number]; rotationY: number; scale: number;
}
export interface PanoramaRef { kind: 'example' | 'upload'; dataUrl?: string }
export interface ProjectFile {
  version: 1; panorama: PanoramaRef | null; characters: Character[];
  camera: { azimuth: number; polar: number; fov: number };
}
```

Store shape & actions: `characters`, `selectedId`, `transformMode`, `panorama`, `showGrid`, plus
`addCharacter()` (auto color from palette by index, default pose 'standing', position in front of camera, selects it), `removeCharacter(id)`, `selectCharacter(id|null)`, `updateCharacter(id, patch)`, `setTransformMode`, `setPanorama`, `loadProject(ProjectFile)`, `reset()`. Use a module counter (not Date/random) for ids: `c-1`, `c-2`, ...

- [ ] Tests: addCharacter increments count + assigns distinct colors + selects new one; removeCharacter clears selection if it was selected; updateCharacter merges patch; loadProject replaces characters & panorama. Run `npx vitest run tests/store.test.ts` — expect pass. Commit.

## Task 3: Palette + poses (TDD)

**Files:** Create `src/data/palette.ts`, `src/data/poses.ts`, `tests/palette.test.ts`, `tests/poses.test.ts`.

`palette.ts`: `export const PALETTE = ['#e6194b','#3cb44b','#4363d8','#f58231','#911eb4','#42d4f4','#f032e6','#bfef45','#fabed4','#469990']` and `colorForIndex(i)=PALETTE[i % PALETTE.length]`.

`poses.ts`: define joint names and a `Pose = Partial<Record<JointName, [x,y,z] euler radians>>` plus `rootY` (vertical offset for sitting/crouching). Joints: `torso, head, lShoulder, lElbow, rShoulder, rElbow, lHip, lKnee, rHip, rKnee`. Provide `POSES: Record<PoseName, Pose>` with sensible angles (standing ~neutral arms slightly out; sitting hips bent ~-90° about X, knees bent, rootY lowered; walking opposite arm/leg swing; crouching knees deep + rootY low; pointing right arm forward; arms-raised shoulders up).

- [ ] Tests: every `PoseName` exists in `POSES`; `colorForIndex` wraps; standing has near-zero rotations; sitting has non-zero `rootY` < 0 and bent hips. Run vitest — pass. Commit.

## Task 4: Project serialize/deserialize (TDD)

**Files:** Create `src/lib/project.ts`, `tests/project.test.ts`.

`serializeProject(state) -> ProjectFile` and `parseProject(json: unknown) -> ProjectFile` (validates `version===1`, characters array shape, throws on bad input). Keep pure (no DOM).

- [ ] Tests: round-trip serialize→JSON.stringify→JSON.parse→parseProject equals original; parseProject rejects `{}` and wrong version. Run vitest — pass. Commit.

## Task 5: PanoramaSphere

**Files:** Create `src/three/PanoramaSphere.tsx`.

Renders `<mesh scale={[-1,1,1]}>` with `<sphereGeometry args={[100,60,40]}/>` and `<meshBasicMaterial map={texture} side={THREE.BackSide? or front given flip} toneMapped={false}/>`. Load texture from a `src` prop (data URL or `/example.png`) via `THREE.TextureLoader`/`useLoader`; set `colorSpace = SRGBColorSpace`. If `src` null render nothing.

- [ ] Manual check inside Scene (Task 7). No unit test (DOM/WebGL). Commit with Task 7.

## Task 6: Mannequin

**Files:** Create `src/three/Mannequin.tsx`.

Build nested groups for joints using `POSES[pose]` rotations and `rootY`. Body parts via capsule/sphere geometries; material color = `color` prop, joints/head a darker shade (`new THREE.Color(color).multiplyScalar(0.7)`). Total height ~1.8, feet at group y origin (so it stands on grid). Wrap in an outer `<group position rotation-y scale>` driven by props. When `selected`, render drei `<Outlines>` (or emissive) for highlight. Forward a ref to the outer group for TransformControls. Make the whole figure `raycast`-selectable: onClick calls `onSelect(id)`.

- [ ] Manual check in Scene. Commit with Task 7.

## Task 7: Scene (camera, controls, grid, lights, transform)

**Files:** Create `src/three/Scene.tsx`, `src/three/FovZoom.tsx`.

- `<Canvas gl={{ preserveDrawingBuffer: true }} camera={{ position:[0,0,0.1], fov:75, near:0.01, far:1000 }}>`.
- Lights: hemisphere + directional so mannequins are readable.
- `<PanoramaSphere src=...>`, `<Grid>` at `y=-1.6` (toggle by `showGrid`), args sized ~40, fade.
- Map `characters` -> `<Mannequin>` with refs kept in a `Map`.
- `<OrbitControls makeDefault enablePan={false} enableZoom={false} target={[0,0,0]} rotateSpeed={-0.4} />` (negative = natural drag from inside).
- `<FovZoom>`: `useThree` camera; on canvas `wheel`, adjust `camera.fov` clamped [20,90], `updateProjectionMatrix()`.
- When `selectedId` set and ref exists: `<TransformControls object={ref} mode={transformMode} showY={mode!=='translate'} translationSnap=null>` — restrict translate to XZ (showX/showZ true, showY false) and rotate to Y only (showX/showZ false). On change, write back position/rotationY/scale to store via `updateCharacter`.
- Click empty space deselects.

- [ ] Verify in dev: panorama visible, drag looks around, wheel zooms, adding chars shows mannequins, selecting shows gizmo, move/rotate/scale writes to store. Commit Tasks 5–7.

## Task 8: Exporter

**Files:** Create `src/lib/exporter.ts`.

- `downloadDataUrl(url, filename)` helper (anchor click).
- `exportPng(gl, scene, camera, { hide:[grid, transform] })`: set helper objects `.visible=false`, `gl.render(scene,camera)`, `url=gl.domElement.toDataURL('image/png')`, restore visibility, return url. (Called from Scene which has gl/scene/camera; expose via a ref/callback or a small bridge component using `useThree`.)
- `saveProject(state)` -> serialize -> `downloadDataUrl(data:application/json,...)`.

- [ ] Unit-test `downloadDataUrl` filename logic is trivial; main verification via E2E. Commit.

## Task 9: Toolbar + SidePanel UI

**Files:** Create `src/ui/Toolbar.tsx`, `src/ui/SidePanel.tsx`; wire into `App.tsx`.

Toolbar buttons: Upload panorama (`<input type=file accept=image/*>` -> FileReader -> dataURL -> setPanorama upload), Load example (`setPanorama {kind:'example'}`), Add character, Move/Rotate/Scale segmented toggle (bound to transformMode), Export PNG, Save project, Load project (`<input type=file accept=.json>`). Each has a stable `data-testid`.

SidePanel: list characters (color swatch button selects; delete button); for selected: pose `<select>` (PoseName options), color `<input type=color>`, size `<input type=range 0.3..3>`. All bound to store; `data-testid`s for E2E.

- [ ] Verify in dev. Commit.

## Task 10: Wire panorama source + auto-load example

**Files:** Modify `App.tsx`/`Scene.tsx`.

- Resolve `panorama` to a `src` string: `kind==='example'` -> `/example.png`; `upload` -> dataUrl.
- On first mount, default `panorama` to `{kind:'example'}` so the app is immediately useful.

- [ ] Verify example loads on start. Commit.

## Task 11: Playwright E2E smoke + screenshots

**Files:** Create `playwright.config.ts` (chromium, `--use-gl=angle`/swiftshader for WebGL, webServer = `npm run dev`), `e2e/smoke.spec.ts`.

Test steps (with `page.screenshot` after each milestone into `e2e/__screenshots__/`):
1. goto app; wait for canvas; screenshot `01-loaded`.
2. click Add character ×2; assert side panel lists 2 items with different swatch colors; screenshot `02-two-chars`.
3. select char 2, choose pose 'sitting'; select char 1 keep 'standing'; screenshot `03-poses`.
4. switch transform mode to rotate; (gizmo present) ; screenshot `04-gizmo`.
5. click Export PNG; capture download; assert file size > 5KB and PNG magic bytes; save to `e2e/__screenshots__/export.png`.
6. Collect console errors via `page.on('console')` and `page.on('pageerror')`; assert none (allow benign warnings).

- [ ] Run `npx playwright test`; expect all pass. Inspect screenshots. Commit.

## Task 12: Green gate

- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run build` clean.
- [ ] `npx vitest run` all pass.
- [ ] `npx playwright test` all pass.
- [ ] Manually open screenshots / export.png and confirm panorama + distinct-colored posed mannequins render. Final commit.

---

## Self-Review

- **Spec coverage:** §3 stack→T1; §4 camera/grid/controls→T7; §5 mannequin/poses/color/manip→T3,T6,T7; §6 UI→T9; §7 export+project→T4,T8,T9; §8 store→T2; §9 components→all; §10 testing→T11,T12. Covered.
- **Placeholders:** none — each task names exact files, code shapes, and run commands.
- **Type consistency:** `Character`, `PoseName`, `TransformMode`, `ProjectFile` defined once in T2 and reused; store action names consistent across tasks.
