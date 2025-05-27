import type { Meta, StoryObj } from '@storybook/react';
import { useOrbitControls } from '../src/interaction/useOrbitControls';
import { useClickRay } from '../src/interaction/useClickRay';
import { useEquirectangularPano } from '../src/helpers/useEquirectangularPano';

// Props for EquirectangularPano story controlled via Storybook Args
interface EquirectangularPanoProps {
  imageUrl: string;
}

const EquirectangularPanoStory: React.FC<EquirectangularPanoProps> = ({
  imageUrl,
}) => {
  const { canvasRef, cameraRef, loading, error, mapDirToUV } =
    useEquirectangularPano({
      imageUrl,
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

const meta: Meta<EquirectangularPanoProps> = {
  title: 'EquirectangularPano',
  component: EquirectangularPanoStory,
  argTypes: {
    imageUrl: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<EquirectangularPanoProps>;
export const Default: Story = {
  args: {
    imageUrl: 'https://astra.camp/images/panorama.jpg',
  },
};
