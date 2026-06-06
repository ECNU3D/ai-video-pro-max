# 🎬 Director Staging Board

A web tool for composing director's blocking references on top of a 360°
panorama. Load a panorama, place colored 3D mannequin puppets in posed
positions, frame a shot, and export a flat PNG that can be fed to a video
generation model (e.g. Seedance) so characters are positioned precisely.

![exported frame](e2e/__screenshots__/export.png)

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

The bundled example panorama (`public/example.png`) loads on first run.

## How to use

- **Look around / zoom** — drag the canvas to rotate the view; mouse wheel
  changes the field of view (panoramic zoom).
- **Upload panorama** — load your own equirectangular (2:1) 360° image, or
  click *Load example*.
- **Add character** — spawns a posable mannequin in a distinct color, in front
  of the camera.
- **Select** — click a puppet in the scene, or a row in the side panel.
- **Move / Rotate / Scale** — pick a mode in the toolbar, then drag the gizmo.
  Move slides along the floor, Rotate turns the puppet on **any axis** (yaw to
  face, pitch/roll to tip it over), Scale resizes uniformly. Pose, color, size,
  height and rotation (yaw / pitch / roll) are also editable in the side panel.
- **Poses** — standing, sitting, walking, crouching, pointing, arms-raised,
  lying.
- **Lay someone down** — either pick the **lying** pose (one click, flat on the
  back) or take any pose and **pitch** it 90° with the gizmo/slider. Then raise
  **Height** to rest the figure on a bed or sofa, and **yaw** to align it.
- **Export PNG** — renders one clean frame (grid, gizmo and selection ring
  hidden) and downloads it.
- **Save / Load** — store the whole composition (panorama reference, every
  character's color/pose/position/rotation/scale, and the camera) to a JSON
  project file and reload it later.

## How it works

A large inside-out sphere (`THREE.BackSide`) textured with the equirectangular
image is the panorama. The camera sits at eye height (1.6) near the sphere
center; `OrbitControls` rotates the view and the wheel drives FOV. Mannequins
are procedural figures built from primitives, posed by per-joint rotations, and
stand on a virtual floor at `y = 0`. Selecting one attaches a drei
`TransformControls` gizmo that writes transforms back to a zustand store.

> Note: a 2D panorama has no real depth, so puppet size is matched to the scene
> by hand (scale/move). This is intentional for v1.

## Tech stack

Vite · React 19 · TypeScript · three.js · @react-three/fiber · @react-three/drei
· zustand. Tested with Vitest (pure logic) and Playwright (headless WebGL +
screenshot checks).

## Scripts

```bash
npm run dev         # dev server
npm run build       # typecheck + production build
npm test            # unit tests (Vitest)
npm run e2e         # end-to-end tests (Playwright)
```

## Project layout

```
src/
  three/      panorama sphere, mannequin, scene, camera/fov controls
  store/      zustand scene store
  data/       color palette, pose presets
  lib/        project serialize/parse, PNG/JSON export
  ui/         toolbar, side panel
docs/superpowers/   design spec + implementation plan
e2e/                Playwright specs + screenshots
```
