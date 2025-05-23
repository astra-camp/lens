import React, { useMemo, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useLoader } from '../src/utils/useLoader';
import { useEquirectangularDrawConfig } from '../src/drawConfigs/useEquirectangularDrawConfig';
import { usePointerPan } from '../src/interaction/usePointerPan';
import { useClickHitTest } from '../src/interaction/useClickHitTest';
import { useRenderer } from '../src/rendering/useRenderer';
import type { CameraState } from '../src/types/CameraState';
import { useREGL } from '../src/rendering/useREGL';

// Props for DemoScene story controlled via Storybook Args
interface DemoSceneProps {
  imageUrl: string;
  latBands: number;
  longBands: number;
  width: number | string;
  height: number;
  pixelRatio: number;
}

const DemoSceneStory: React.FC<DemoSceneProps> = ({
  imageUrl,
  latBands,
  longBands,
  width,
  height,
  pixelRatio,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const regl = useREGL({
    canvas: canvasRef.current ?? undefined,
    attributes: { preserveDrawingBuffer: true },
    pixelRatio,
  });

  // load panorama image from provided URL
  const {
    data: image,
    loading,
    error,
  } = useLoader(async () => {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
    }
    const blob = await res.blob();
    return createImageBitmap(blob);
  }, [imageUrl]);

  // camera state stored in ref to avoid re-renders
  const cameraRef = useRef<CameraState>({ yaw: 0, pitch: 0, fov: Math.PI / 2 });

  // draw config with custom subdivisions
  const drawConfig = useEquirectangularDrawConfig({
    regl,
    canvasRef,
    cameraRef,
    image,
    latBands,
    longBands,
  });

  // pointer pan to update yaw/pitch
  usePointerPan(canvasRef, (dx, dy) => {
    const c = cameraRef.current;
    c.yaw -= dx * 0.005;
    c.pitch = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, c.pitch - dy * 0.005)
    );
  });

  // click hit-test logs UV coords
  useClickHitTest(canvasRef, cameraRef.current, (uv, e) => {
    console.log('Clicked UV coords:', uv);
  });

  // render loop
  useRenderer({
    regl,
    drawConfigs: [drawConfig],
  });

  return (
    <div style={{ position: 'relative', width }}>
      {loading && <p>Loading panorama...</p>}
      {error && <p>Error loading panorama</p>}
      <canvas id="renderer" ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  );
};

const meta: Meta<DemoSceneProps> = {
  title: 'DemoScene',
  component: DemoSceneStory,
  argTypes: {
    imageUrl: { control: 'text' },
    latBands: { control: { type: 'number', min: 10, max: 100, step: 1 } },
    longBands: { control: { type: 'number', min: 10, max: 100, step: 1 } },
    width: { control: 'text' },
    height: { control: 'number', min: 100, max: 800, step: 50 },
    pixelRatio: { control: 'number', min: 0.5, max: 2, step: 0.1 },
  },
};
export default meta;

type Story = StoryObj<DemoSceneProps>;
export const Default: Story = {
  args: {
    imageUrl: 'https://astra.camp/images/panorama.jpg',
    latBands: 40,
    longBands: 60,
    width: '100%',
    height: 400,
    pixelRatio: window.devicePixelRatio,
  },
};
