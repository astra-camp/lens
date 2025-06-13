# Lens

A modern, plugin-based WebGL rendering engine built with TypeScript and React. Lens provides a flexible and extensible architecture for creating interactive 3D experiences, with a particular focus on panoramic viewing and virtual tours.

## Features

- 🎥 Plugin-based architecture for easy extensibility
- 🖼️ Built-in support for equirectangular panoramas
- 🎮 Interactive camera controls (orbit, click)
- 🔍 Hotspot system for interactive elements
- ⚛️ First-class React integration
- 📱 Responsive design with proper device pixel ratio handling
- 🎯 TypeScript support with comprehensive type definitions

## Installation

```bash
npm install @astra-camp/lens
# or
yarn add @astra-camp/lens
```

## Quick Start

```tsx
import { useLens } from '@astra-camp/lens';
import { equirectangularPano } from '@astra-camp/lens/plugins/geometry';
import { orbitControls } from '@astra-camp/lens/plugins/interaction';

function PanoramaViewer() {
  const plugins = useMemo(() => [
    equirectangularPano({ image: panoramaImage }),
    orbitControls(),
  ], [panoramaImage]);

  const { canvasRef } = useLens({ plugins });

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100vh' }}
    />
  );
}
```

## Core Concepts

### Plugins

Lens uses a plugin-based architecture that allows you to extend its functionality. Each plugin can:
- Modify the rendering state
- Add draw commands
- Register lifecycle callbacks
- Handle user interactions

Example plugin:
```typescript
import { Plugin } from '@astra-camp/lens';

const myPlugin: Plugin = (getState, setState, registerCallbacks) => {
  // Register setup callback
  registerCallbacks.onSetup(() => {
    // Initialize resources
  });

  // Register frame callback
  registerCallbacks.onFrame(({ dt, elapsed }) => {
    // Update state each frame
  });

  // Register cleanup callback
  registerCallbacks.onCleanup(() => {
    // Clean up resources
  });

  // Return initial state update
  return {
    // State updates
  };
};
```

### State Management

Lens maintains a central state that includes:
- Camera parameters (yaw, pitch, FOV)
- WebGL context and resources
- Draw commands
- Canvas properties

State updates are handled immutably through the `setState` function:

```typescript
setState((state) => ({
  camera: {
    ...state.camera,
    yaw: newYaw,
    pitch: newPitch
  }
}));
```

## Built-in Plugins

### Geometry

- `equirectangularPano`: Renders equirectangular panorama images
- `sphereMesh`: Creates sphere meshes for panorama viewing

### Interaction

- `orbitControls`: Provides orbit camera controls
- `clickRay`: Handles click interactions and ray casting
- `pointerPan`: Base plugin for pointer-based panning

### Tour

- `drawHotSpots`: Renders interactive hotspots
- `hotSpotClick`: Handles hotspot click interactions

## React Integration

Lens provides a `useLens` hook for easy integration with React:

```typescript
const { canvasRef, setState } = useLens({
  plugins: [...],
  reglOptions: {...},
  clearOptions: {...}
});
```

The hook handles:
- Canvas lifecycle management
- Device pixel ratio
- Window resizing
- Plugin initialization and cleanup

## Performance Considerations

- Lens automatically handles device pixel ratio for crisp rendering
- Draw commands are batched and optimized
- Resources are properly cleaned up when components unmount
- State updates are immutable and efficient

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

