# Lens Layered Architecture Overview

Lens is a lightweight, hook-first React library for building WebGL-powered 3D viewers. It provides a modular, layered architecture.

## Global Conventions

- **Coordinate System**: Right-handed (X → right, Y → up, Z → forward)
- **Math Library**: All vector, matrix, and quaternion operations use **gl-matrix**
- **Extensibility**: Custom plugins or hooks can access `{ scene, cameraRef, canvasRef, useFrame }` without altering core layers.
- **Material-First**: All visuals are driven by `MaterialHandle` instances (standard or custom shaders), unifying textured and shader-based rendering.
- **Global Time Uniform**: Inject a `uTime` uniform (seconds) into every material automatically.
- **Performance**: Leverage React refs to prevent per-frame re-renders; dynamics reside in WebGL.
- **Resource Lifecycle**: GPU assets are loaded and cleaned up via `useEffect` hooks with optional `onDispose` callbacks.
- **SSR / Hydration**: `useREGLRenderer` supports `headless` mode for offscreen rendering (e.g., server-side thumbnails).

## Naming Conventions

- `*Ref`: reserved only for React refs (mutable objects with `.current`), e.g., `cameraRef`, `canvasRef`.
- `*Handle`: for WebGL draw- or resource handles, e.g., `MaterialHandle`, `MeshHandle`, `SceneHandle`.
- `*Resource`: for things you load or cache, e.g., `TextureResource`.

---

## Layer 1: Composition API

### Hook-First Composition (`useLens`)

The `useLens` hook bundles scene creation, camera state, and frame-loop registration into one composable primitive. It returns stable refs and the `useFrame` function for incremental updates:

```ts
export interface FrameContext {
  dt: number;
  elapsed: number;
}

export interface UseLensOptions {
  renderUnits?: RenderUnitConfig[];
  initialCamera?: Partial<CameraState>;
  onFrame?: (ctx: FrameContext) => void;
}

export function useLens(opts: UseLensOptions) {
  const { renderUnits = [], initialCamera, onFrame } = opts;
  const scene = useScene(renderUnits);
  const cameraRef = useCameraState(initialCamera);
  const frameHook = useFrame;
  if (onFrame) frameHook(onFrame);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  return { scene, cameraRef, canvasRef, useFrame: frameHook };
}
```

To handle plugin lifecycles, Lens provides a companion `usePlugins` helper:

```ts
export function usePlugins(
  plugins: LensPlugin[],
  ctx: { scene; cameraRef; canvasRef; useFrame }
) {
  useEffect(() => {
    plugins.forEach((p) => p.onInit?.(ctx));
    return () => plugins.forEach((p) => p.onDestroy?.());
  }, [plugins, ctx]);
}
```

This hook-first layer removes hidden context, making composition explicit and ref-driven.

---

## Layer 2: Resources

In this layer, we handle async loading of GPU assets with explicit `loading`/`error` state, making it easy to display progress indicators or error messages.

### 1. Promise-based loader

```ts
function loadEquirectangularTexturePromise(
  url: string
): Promise<TextureResource> {
  return new Promise((resolve, reject) => {
    const tex = new TextureResource(url);
    tex._onLoad = () => resolve(tex);
    tex._onError = (err: Error) => reject(err);
    tex.load();
  });
}
```

### 2. Explicit React hook

```ts
import { useState, useEffect } from 'react';

interface TextureHookState {
  resource: TextureResource | null;
  loading: boolean;
  error: Error | null;
}

export function useEquirectangularTexture(url: string): TextureHookState {
  const [state, setState] = useState<TextureHookState>({
    resource: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    setState({ resource: null, loading: true, error: null });

    loadEquirectangularTexturePromise(url)
      .then((tex) => {
        if (!cancelled) {
          setState({ resource: tex, loading: false, error: null });
        } else {
          tex.dispose?.();
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ resource: null, loading: false, error: err });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
```

#### Benefits of explicit loading hooks

- **Fine-grained UI control**: show progress bars, retry buttons, or custom spinners per resource.
- **Approachable API**: familiar `{ loading, error, data }` model for teams new to Suspense.
- **Easy to extend**: add timeout logic, retries, or progress callbacks without altering component logic.

---

## Layer 3: Material / Shader

Compile and manage shader programs, injecting global uniforms and handling custom logic:

```ts
function useMaterial(
  vertSrc: string,
  fragSrc: string,
  uniforms?: Record<string, any>
): MaterialHandle;

function useTextureMaterial(texture: TextureResource): MaterialHandle;
```

Responsibilities:

- Compile/link REGL shader programs.
- Inject `uTime` and other global uniforms.
- Update uniforms and dispose shaders on unmount.

---

## Layer 4: Render Unit

Bind geometries to materials, creating self-contained draw commands:

```ts
interface Transform {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  matrix?: number[];
}

interface RenderUnitConfig {
  mesh: MeshHandle;
  material: MaterialHandle;
  transform?: Transform;
}
```

Responsibilities:

- Define one draw call per `RenderUnitConfig`.
- Expose geometry hooks (`useSphereMesh`, `useCubeMesh`) returning `MeshHandle`.
- Manage attribute/index buffers per unit.

---

## Layer 5: Scene Composition

Gather render units into a stable scene graph for rendering:

```ts
function useScene(renderUnits?: RenderUnitConfig[]): SceneHandle;
```

Responsibilities:

- Reflect declarative arrays of `RenderUnitConfig` into a single `SceneHandle`.
- Handle grouping, transforms, enable/disable flags, and render order.
- Ensure minimal diffs so updates are applied in place.

---

## Layer 6: Camera State

Manage view/projection parameters and dynamic updates:

```ts
interface CameraState {
  yaw: number;
  pitch: number;
  fov: number;
  velocity?: { yaw: number; pitch: number };
  locked?: boolean;
}

function useCameraState(
  initial?: Partial<CameraState>
): React.MutableRefObject<CameraState>;
```

Responsibilities:

- Store camera angles and FOV in a ref.
- Support optional damping/momentum via `velocity`.
- Respect `locked` to disable interactions when needed.

---

## Layer 7: Frame Loop

Provide a unified animation loop for per-frame callbacks and time management:

```ts
function useFrame(callback: (ctx: FrameContext) => void): void;
```

Responsibilities:

- Batch all callbacks into one `requestAnimationFrame` loop.
- Supply `dt` (delta time) and `elapsed` (seconds since start).
- Allow pausing or custom throttling.

---

## Layer 8: Renderer

Drive WebGL draw calls using REGL, consuming scene and camera:

```ts
interface UseREGLRendererOptions {
  scene: SceneHandle;
  cameraRef: React.RefObject<CameraState>;
  headless?: boolean;
  pixelRatio?: number;
  glOptions?: WebGLContextAttributes;
  onCreated?: (ctx: {
    regl: REGL;
    scene: SceneHandle;
    cameraRef: React.RefObject<CameraState>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
  }) => void;
  onError?: (error: Error) => void;
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

function useREGLRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  opts: UseREGLRendererOptions
): void;
```

Responsibilities:

- Compile draw commands per `RenderUnitConfig` in `scene`.
- Manage the main render loop and surface errors.

---

## Usage Example

```tsx
function MyViewer() {
  const { scene, cameraRef, canvasRef, useFrame } = useLens({
    // ...your options...
  });

  useFrame(({ dt, elapsed }) => {
    // ...per-frame logic...
  });

  useREGLRenderer(canvasRef, {
    scene,
    cameraRef,
    pixelRatio: window.devicePixelRatio,
  });

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}
```

---

## Layer 9: Interaction

Handle user input to mutate camera or scene:

```ts
interface PanOptions {
  damping?: number;
  threshold?: number;
  enabled?: boolean;
}
interface PinchZoomOptions {
  sensitivity?: number;
  minDistance?: number;
  maxDistance?: number;
  enabled?: boolean;
}

function usePanInteraction(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  cameraRef: React.MutableRefObject<CameraState>,
  options?: PanOptions
): void;

function usePinchZoomInteraction(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  cameraRef: React.MutableRefObject<CameraState>,
  options?: PinchZoomOptions
): void;
```

Responsibilities:

- Listen to pointer/touch/wheel events on `canvasRef`.
- Update `cameraRef.current` directly for instant feedback.
- Clean up event listeners on unmount.

---

## Layer 10: Effects

Apply procedural or automated behaviors each frame:

```ts
interface AutoRotateOptions {
  speed?: number;
  axis?: [number, number, number];
  enabled?: boolean;
}

function useAutoRotate(
  cameraRef: React.MutableRefObject<CameraState>,
  useFrame: typeof useFrame,
  options?: AutoRotateOptions
): void;
```

Responsibilities:

- Mutate `cameraRef.current` in `useFrame` callbacks.
- Support inertia, smoothing, and custom keyframe animations.

---

## Layer 11: Hit Testing

Map screen-space input to scene intersections:

```ts
interface HitInfo {
  point: [number, number, number];
  normal: [number, number, number];
  object: unknown;
  uv?: [number, number];
  index?: number;
}

function useHitTest(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  callback: (hit: HitInfo | null) => void
): void;
```

Responsibilities:

- Convert pointer coordinates via `canvasRef` to world-space rays.
- Perform raycasting against `scene` and return hit details.
- Support throttling and batch queries.

---

## Layer 12: Plugin / Extension API

Allow external modules to extend Lens lifecycles:

```ts
interface LensPlugin {
  onInit?: (ctx: { scene; cameraRef; canvasRef; useFrame }) => void;
  onDestroy?: () => void;
}
```

Register plugins via the `usePlugins` hook (no context-based `usePlugin`). Plugins receive core refs and can allocate or clean up as needed.

---
