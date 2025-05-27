import type { Meta, StoryObj } from '@storybook/react';
import { useOrbitControls } from '../src/interaction/useOrbitControls';
import { useClickRay } from '../src/interaction/useClickRay';
import {
  useCubeMapPano,
  UseCubeMapPanoProps,
} from '../src/helpers/useCubeMapPano';

import nzUrl from './images/nz.jpg?url';
import pzUrl from './images/pz.jpg?url';
import pyUrl from './images/py.jpg?url';
import nyUrl from './images/ny.jpg?url';
import pxUrl from './images/px.jpg?url';
import nxUrl from './images/nx.jpg?url';

interface CubeMapPanoProps {}

// Nested face URLs: [face][row][col] order: [-Z, +Z, +Y, -Y, +X, -X]
const faceUrls: string[][][] = [
  [[nzUrl]],
  [[pzUrl]],
  [[pyUrl]],
  [[nyUrl]],
  [[pxUrl]],
  [[nxUrl]],
];

const CubeMapPanoStory: React.FC<CubeMapPanoProps> = () => {
  const { canvasRef, cameraRef, loading, error, mapDirToUV } = useCubeMapPano({
    faceUrls,
  });

  // orbit controls for camera movement
  useOrbitControls(canvasRef, cameraRef);

  // click ray for hit testing
  useClickRay(canvasRef, cameraRef, (dir, e) => {
    const uv = mapDirToUV(dir);
    console.log('Clicked UV:', uv, 'Event:', e);
  });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {loading && <p>Loading panorama...</p>}
      {error && <p>Error loading panorama</p>}
      <canvas
        id="renderer"
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

const meta: Meta<CubeMapPanoProps> = {
  title: 'CubeMapPano',
  component: CubeMapPanoStory,
};
export default meta;

type Story = StoryObj<UseCubeMapPanoProps>;
export const Default: Story = {};
