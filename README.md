# Lens Layered Architecture Overview

## Global Conventions

- **Coordinate System**: Right-handed (X → right, Y → up, Z → forward)
- **Math Library**: All vector/matrix/quaternion ops use **gl-matrix**
- **Context-Driven**: All core hooks and components consume `LensContext` rather than requiring manual prop threading.
- **Extensibility**: Custom plugins or hooks can access `{ scene, canvasRef, useFrame }` from context without modifying core layers.
- **Material-First**: All visuals are driven by materials—both standard and custom shaders—unifying textured and shader-based rendering.
- **Global Time Uniform**: Expose a `uTime` uniform that increments each frame (in seconds) and is automatically injected into all materials.
- **Performance**: Use refs to avoid React re-renders per frame; keep component tree static and push dynamics into WebGL.
- **Resource Lifecycle**: GPU textures, buffers, and shader programs are cleaned up via `useEffect` cleanup; hooks may accept `onDispose` callbacks.
- **TypeScript & Testing**: Expose all types (`CameraState`, `MaterialRef`, etc.) and ensure assets are testable in headless REGL contexts.
- **Error Handling & Diagnostics**: Provide `useRendererError` to catch and bubble errors consistently.
- **SSR / Hydration**: `REGLRenderer` supports `headless` mode (offscreen framebuffer → PNG) for SEO and server-side thumbnails.

## Layer 1: Context Provider

The Context Provider layer initializes and maintains the core `LensContext`, handling plugin lifecycles and exposing foundational APIs for the entire render pipeline.

### Responsibilities

- Initialize and maintain context values, including `scene`, `cameraRef`, `canvasRef`, and `useFrame`.
- Register and manage plugin lifecycles (`onInit` / `onDestroy`) via the `usePlugin` hook.
- Expose core APIs to downstream layers without manual prop threading.
- Offer debug and inspection utilities through context (e.g., sampling `uTime`).

Here’s the `LensContextValue` interface and `LensContextProvider` component:

```ts
interface LensContextValue {
  scene: SceneRef;
  cameraRef: React.MutableRefObject<CameraState>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  useFrame: (callback: (frame: FrameContext) => void) => void;
}

export function LensContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const scene = createScene();
  const cameraRef = useRef(initCamera());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <LensContext.Provider value={{ scene, cameraRef, canvasRef, useFrame }}>
      {children}
    </LensContext.Provider>
  );
}
```

Here’s the shape of the `usePlugin` hook:

```ts
function usePlugin(plugin: LensPlugin): void {
  const context = useContext(LensContext)!;
  useEffect(() => {
    plugin.onInit?.(context);
    return () => plugin.onDestroy?.();
  }, []);
}
```

## Layer 2: Resources

The Resources layer handles loading, caching, and disposing of GPU assets such as textures, buffers, and geometries.

### Responsibilities

- Load and cache textures (e.g., equirectangular, cube maps) with lifecycle callbacks.
- Manage GPU buffers for geometries, ensuring proper cleanup via `useEffect`.
- Provide hooks to create and dispose resources with optional `onLoad`, `onError`, and `onDispose` callbacks.
- Expose resource readiness states to integrate with render units and scenes.

Here’s the signature of the `useEquirectangularTexture` hook:

```ts
function useEquirectangularTexture(
  url: string,
  options?: {
    onLoad?: () => void;
    onError?: (error: Error) => void;
    onComplete?: () => void;
  }
): TextureResource;
```

Here’s the signature of the `useCubeMapTexture` hook:

```ts
function useCubeMapTexture(
  urls: [string, string, string, string, string, string],
  options?: {
    onLoad?: () => void;
    onError?: (error: Error) => void;
    onComplete?: () => void;
  }
): TextureResource;
```

## Layer 3: Material / Shader

The Material / Shader layer creates and manages shader programs and materials, injecting global uniforms and handling custom shader logic.

### Responsibilities

- Compile and manage shader programs via hooks like `useMaterial` and `useTextureMaterial`.
- Inject global uniforms (e.g., `uTime`) into all materials.
- Support custom shaders with extensible uniform and attribute interfaces.
- Handle material parameter updates and cleanup on unmount.

Here’s the shape of the `useMaterial` and `useTextureMaterial` hooks:

```ts
function useMaterial(
  vertSrc: string,
  fragSrc: string,
  uniforms?: Record<string, any>
): MaterialRef;

function useTextureMaterial(texture: TextureResource): MaterialRef;
```

## Layer 4: Render Unit

The Render Unit layer binds mesh geometries to materials, producing renderable units for the scene.

### Responsibilities

- Define renderable units that combine meshes (geometry) and materials.
- Provide hooks like `useSphereMesh` and `useCubeMesh` for common geometries.
- Manage attribute and index buffers for each render unit.
- Support dynamic updates to mesh parameters and material assignments.

Here’s the shape of the mesh hooks:

```ts
function useSphereMesh(options?: SphereOptions): MeshRef;
function useCubeMesh(options?: CubeOptions): MeshRef;
```

## Layer 5: Scene Composition

The Scene Composition layer organizes render units into a hierarchical scene graph for rendering.

### Responsibilities

- Provide `useScene` to assemble and update the list of render units.
- Manage scene hierarchy, including grouping, transforms, and enable/disable flags.
- Handle render order, transparency sorting, and scene validation.
- Expose a stable `SceneRef` for the renderer to consume.

Here’s the signature of the `useScene` hook:

```ts
function useScene(renderUnits?: RenderUnitConfig[]): SceneRef;
```

## Layer 6: Camera State

The Camera State layer manages view and projection parameters, offering controlled and dynamic camera updates.

### Responsibilities

- Maintain camera parameters (`yaw`, `pitch`, `fov`) in a `MutableRef`.
- Provide `useCameraState` for initializing and accessing camera state.
- Support locking and unlocking of camera interactions.
- Expose camera state for use in rendering and interaction layers.

Here’s the `CameraState` interface and `useCameraState` hook:

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

## Layer 7: Frame Loop

The Frame Loop layer provides a consistent loop for per-frame callbacks and time management.

### Responsibilities

- Expose `useFrame` to register callbacks for each render tick.
- Supply frame context including delta time (`dt`) and elapsed time.
- Batch all callbacks into a single `requestAnimationFrame` loop.
- Enable pausing or throttling of frame updates.

Here’s the signature of the `useFrame` hook:

```ts
function useFrame(callback: (dt: number, elapsed: number) => void): void;
```

## Layer 8: Renderer

The Renderer layer drives the WebGL draw calls using REGL, consuming the scene and camera state.

### Responsibilities

- Initialize REGL on the provided `canvas` or in headless (SSR) mode.
- Hook into context to retrieve `scene`, `cameraRef`, and registered frame callbacks.
- Execute draw calls for all render units each frame.
- Surface rendering errors via `useRendererError`.

Here’s the `REGLRenderer` component shape:

```ts
interface REGLRendererProps
  extends Omit<React.CanvasHTMLAttributes<HTMLCanvasElement>, 'children'> {
  headless?: boolean;
}
const REGLRenderer: React.FC<REGLRendererProps>;
```

## Layer 9: Interaction

The Interaction layer handles user inputs, mutating camera or scene in response to events.

### Responsibilities

- Listen for pan, zoom, and pointer events on `canvasRef`.
- Provide hooks like `usePanInteraction`, `usePinchZoomInteraction`, `useKeyboardControl`, etc.
- Respect camera lock state to disable interactions when `locked` is true.
- Clean up all DOM event listeners on unmount.

Here’s an example of the `usePanInteraction` hook:

```ts
function usePanInteraction(options?: PanOptions): void {
  const { canvasRef, cameraRef } = useContext(LensContext)!;
  // attach pointer listeners, ignore when locked, and update cameraRef.current
}
```

## Layer 10: Effects

The Effects layer applies post-processing and animation effects to the camera or scene.

### Responsibilities

- Provide hooks like `useInertia`, `useAutoRotate`, and keyframe animations.
- Operate purely on `cameraRef` and frame callbacks without DOM access.
- Manage offscreen buffers for complex effects.
- Chain multiple effects in a customizable pipeline.

Here’s an example of the `useInertia` hook:

```ts
function useInertia(options?: InertiaOptions): void {
  const { cameraRef, useFrame } = useContext(LensContext)!;
  useFrame((dt) => {
    // apply inertia to cameraRef.current based on dt
  });
}
```

## Layer 11: Hit Testing

The Hit Testing layer maps pointer events to scene intersections for interactive feedback.

### Responsibilities

- Expose `useHitTest` to perform raycasting against the scene.
- Translate screen coordinates from `canvasRef` to world-space rays.
- Return hit results including mesh references and intersection data.
- Support batching or throttling of hit test queries.

Here’s the signature of the `useHitTest` hook:

```ts
function useHitTest(callback: (hitInfo: HitInfo | null) => void): void;
```

## Layer 12: Plugin / Extension API

The Plugin / Extension API enables external modules to hook into Lens lifecycles and extend functionality.

### Responsibilities

- Define the `LensPlugin` interface with `onInit` and `onDestroy` methods.
- Register plugins through the `usePlugin` hook.
- Grant plugins access to core APIs (`scene`, `cameraRef`, `canvasRef`, `useFrame`).
- Allow plugin-driven resource allocation and cleanup.

Here’s the `LensPlugin` interface and `usePlugin` hook:

```ts
interface LensPlugin {
  onInit?: (context: LensContextValue) => void;
  onDestroy?: () => void;
}
function usePlugin(plugin: LensPlugin): void {
  const context = useContext(LensContext)!;
  useEffect(() => {
    plugin.onInit?.(context);
    return () => plugin.onDestroy?.();
  }, []);
}
```

# Lens Project Structure

```
/ (root)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .storybook/
│   ├── main.js
│   └── preview.js
├── .github/
│   └── workflows/
│       └── release.yml
└── src/
    ├── index.ts
    ├── types/
    │   ├── CameraState.ts
    │   ├── MaterialProps.ts
    │   └── PluginAPI.ts
    ├── core/
    │   ├── context/
    │   │   ├── LensContext.tsx
    │   │   └── usePlugin.ts
    │   ├── resources/
    │   │   ├── useEquirectangularTexture.ts
    │   │   └── useCubeMapTexture.ts
    │   ├── material/
    │   │   ├── useMaterial.ts
    │   │   └── useTextureMaterial.ts
    │   ├── render-unit/
    │   │   ├── useSphereMesh.ts
    │   │   └── useCubeMesh.ts
    │   ├── scene/
    │   │   └── useScene.ts
    │   ├── camera/
    │   │   ├── useCameraState.ts
    │   │   └── types.ts
    │   ├── frame-loop/
    │   │   ├── useFrame.ts
    │   │   └── types.ts
    │   ├── renderer/
    │   │   └── REGLRenderer.tsx
    │   ├── interaction/
    │   │   ├── usePanInteraction.ts
    │   │   └── usePinchZoomInteraction.ts
    │   ├── effects/
    │   │   ├── useInertia.ts
    │   │   └── useAutoRotate.ts
    │   ├── hit-testing/
    │   │   └── useHitTest.ts
    │   └── plugins/
    │       └── LensPlugin.ts
    ├── plugins/
    │   ├── foo.ts
    │   └── bar.ts
    └── stories/
        ├── DemoScene.stories.tsx
        └── PluginExamples.stories.tsx
```
