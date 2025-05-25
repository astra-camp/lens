import type { Meta, StoryObj } from '@storybook/react';
import { useOrbitControls } from '../src/interaction/useOrbitControls';
import { useClickHitTest } from '../src/interaction/useClickHitTest';
import { useEquirectangularPano } from '../src/helpers/useEquirectangularPano';

// Props for DemoScene story controlled via Storybook Args
interface DemoSceneProps {
  imageUrl: string;
}

const DemoSceneStory: React.FC<DemoSceneProps> = ({ imageUrl }) => {
  const { canvasRef, cameraRef, loading, error } = useEquirectangularPano({
    imageUrl,
  });

  // orbit controls for camera movement
  useOrbitControls(canvasRef, cameraRef);

  // click hit-test logs UV coords
  useClickHitTest(canvasRef, cameraRef, (uv, e) => {
    console.log('Clicked UV coords:', uv);
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

const meta: Meta<DemoSceneProps> = {
  title: 'DemoScene',
  component: DemoSceneStory,
  argTypes: {
    imageUrl: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<DemoSceneProps>;
export const Default: Story = {
  args: {
    imageUrl: 'https://astra.camp/images/panorama.jpg',
  },
};
