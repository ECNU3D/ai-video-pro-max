# Director Staging Board — Design Spec

**Date:** 2026-05-31
**Status:** Approved (design), ready for implementation planning

## 1. Purpose

A single-page web app (runs locally) for composing a director's blocking /
staging reference. The user loads a 360° equirectangular panorama, places
colored 3D mannequin puppets in posed positions within the scene, frames a
shot, and exports a flat PNG. That PNG — with characters precisely positioned —
is used as a reference for video generation (e.g. Seedance), giving the model
accurate character placement so generated video is more controllable.

A re-loadable project file lets the user save and resume a composition.

## 2. Confirmed product decisions

These were chosen explicitly with the user:

1. **Camera / placement model:** camera fixed at the panorama-sphere center,
   mouse rotates the view + wheel zooms (FOV). Puppets are 3D figures standing
   on a virtual ground plane around the center, scaled by hand to match the
   scene's apparent depth. (A 2D panorama has no real depth; this is the
   accepted limitation — no depth estimation in v1.)
2. **Puppet form:** procedural "artist mannequin" built from geometric
   primitives — no external model assets, fully posable, each character a
   distinct color.
3. **Output:** flat PNG screenshot **and** save/load of the whole scene as a
   JSON project file.

## 3. Tech stack

- **Vite + React 19 + TypeScript** — dev server, build, type safety.
- **three.js (r165+)**, **@react-three/fiber v9**, **@react-three/drei** —
  declarative Three.js with ready-made `OrbitControls`, `TransformControls`,
  `Grid`, `Outlines` helpers. drei `TransformControls` auto-disables the
  default `OrbitControls` while its gizmo is being dragged (via `makeDefault`),
  which cleanly resolves the camera-vs-puppet drag conflict.
- **zustand** — small store for the character list, selection, and scene
  settings.
- **Playwright (headless Chromium with WebGL)** — developer-run smoke testing
  and screenshot verification.

## 4. Scene & camera model

- A large inside-out sphere (radius ~100) textured with the uploaded
  equirectangular image is the panorama. Geometry is mirrored on X
  (`scale(-1,1,1)`, equivalent to `BackSide`) so text/orientation is correct
  from inside.
- The **camera sits essentially at the sphere center** (eye at origin). Because
  the sphere is huge, the small orbit radius needed by `OrbitControls` produces
  negligible parallax, so it reads as rotating in place. If the OrbitControls
  center-anchoring proves imperfect in practice, fall back to a custom
  quaternion/lon-lat look-around controller (the three.js
  `webgl_panorama_equirectangular` approach).
- A faint **ground grid at y = −1.6** (≈ eye height) gives a floor reference.
  The grid's horizon line lands on the panorama equator, so a puppet standing
  on the grid sits naturally on the photographed floor.
- **Look around:** drei `OrbitControls`, panning disabled.
- **Zoom:** mouse wheel changes camera **FOV** (clamped ~20°–90°) — true
  panoramic zoom, not a dolly. OrbitControls' own zoom (dolly) is disabled.

## 5. Puppet — procedural mannequin

- A hierarchical figure built from primitives: sphere head, capsule torso and
  limbs, joint spheres at shoulders/elbows/hips/knees. Classic posable
  artist-mannequin look. Approx human proportions (~1.8 units tall, feet at the
  group origin so the group can sit on the grid).
- **Pose presets** = sets of joint rotations applied to the named joints:
  **Standing, Sitting, Walking, Crouching, Pointing, Arms-raised** (~6 to
  start; structure allows adding more). Sitting/crouching also lower the
  hip/root so the figure reads as seated on the floor/an implied chair.
- **Color:** each new character is auto-assigned the next distinct hue from a
  fixed palette; editable via a color picker. Color tints the body materials;
  head/joints use a slightly varied shade so form is readable.
- **Manipulation:**
  - Click a puppet to **select** it (selected puppet shows an outline).
  - `TransformControls` gizmo with a mode toggle:
    - **Move** — translate on the XZ ground plane (Y locked) so puppets stay on
      the floor.
    - **Rotate** — around Y only, to set facing direction.
    - **Scale** — uniform, to match apparent size/depth.
  - OrbitControls auto-disables while the gizmo is dragged.

## 6. UI layout

- Full-bleed 3D canvas.
- **Top toolbar:** Upload panorama · Load example · Add character ·
  Move/Rotate/Scale toggle · Export PNG · Save project · Load project.
- **Side panel:** character list (color swatch + name + select + delete); for
  the selected character: pose dropdown, color picker, size slider.
- **Help hint** describing controls: drag = look around, wheel = zoom, click
  puppet = select, gizmo = move/rotate/scale.

## 7. Export & project file

- **Export PNG:** temporarily hide the grid and the gizmo/selection outline →
  render one frame → `renderer.domElement.toDataURL('image/png')` → trigger
  download. The canvas is created with `preserveDrawingBuffer: true` so the
  capture is reliable. Result is a clean flat frame of the current view with
  the puppets composited in.
- **Project file (JSON):** schema includes
  - `panorama`: source reference (data URL or "example"),
  - `characters[]`: `{ id, name, color, pose, position[3], rotationY, scale }`,
  - `camera`: orientation (azimuth/polar or quaternion) and `fov`.
  - Save → download `.json`. Load → restore panorama, all characters, and
    camera.

## 8. State model (zustand)

- `characters: Character[]`
- `selectedId: string | null`
- `transformMode: 'translate' | 'rotate' | 'scale'`
- `panorama: { kind: 'example' | 'upload', dataUrl?: string } | null`
- `showGrid: boolean`
- Actions: `addCharacter`, `removeCharacter`, `selectCharacter`,
  `updateCharacter`, `setTransformMode`, `setPanorama`, `loadProject`,
  `serializeProject`.

## 9. Component breakdown

- `App` — layout shell (toolbar, side panel, canvas).
- `Scene` (R3F `<Canvas>` contents) — panorama sphere, ground grid, lights,
  camera, controls, and the set of `Mannequin`s; owns selection raycasting and
  the active `TransformControls`.
- `PanoramaSphere` — the textured inside-out sphere.
- `Mannequin` — the procedural posable figure; props: color, pose, transform;
  applies pose joint rotations.
- `Toolbar`, `SidePanel`, `CharacterListItem` — UI controls bound to the store.
- `useSceneStore` — zustand store (§8).
- `poses.ts` — pose preset definitions (joint-rotation maps).
- `exporter.ts` — PNG capture and project save/load helpers.

## 10. Testing (developer-run)

- `tsc --noEmit` and `vite build` must pass with no errors.
- Playwright headless (Chromium, WebGL via SwiftShader/ANGLE) smoke test:
  1. Load the app, auto/Load example panorama.
  2. Add 2 characters; confirm they appear with distinct colors.
  3. Set them to different poses (e.g. Standing, Sitting).
  4. Select one, switch transform mode, move/rotate it.
  5. Export PNG; assert a non-empty PNG download is produced.
  6. Assert no uncaught console errors throughout.
  - Capture step-by-step screenshots and visually inspect them to confirm real
    rendering (panorama visible, puppets visible, distinct colors, poses
    differ).

## 11. Out of scope (YAGNI for v1)

- True depth-aware placement (depth estimation).
- Multiple panoramas / scene switching in one project.
- Animation playback or a timeline.
- Lighting / shadow matching to the photo.
- Mobile / touch interaction polish.
