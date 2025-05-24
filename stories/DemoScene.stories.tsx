import type { Meta, StoryObj } from '@storybook/react';
import { useImageLoader } from '../src/utils/useLoader';
import { useEquirectangularDrawCommand } from '../src/drawCommands/useEquirectangularDrawCommand';
import { useOrbitControls } from '../src/interaction/useOrbitControls';
import { useClickHitTest } from '../src/interaction/useClickHitTest';
import { useRenderer } from '../src/rendering/useRenderer';
import { useLens } from '../src/helpers/useLens';

// Props for DemoScene story controlled via Storybook Args
interface DemoSceneProps {
  imageUrl: string;
  width: number | string;
  height: number | string;
}

const DemoSceneStory: React.FC<DemoSceneProps> = ({
  imageUrl,
  width,
  height,
}) => {
  const { regl, cameraRef, canvasRef } = useLens();
  const { data, loading, error } = useImageLoader(imageUrl);

  // draw config with custom subdivisions
  const draw = useEquirectangularDrawCommand({
    regl,
    canvasRef,
    cameraRef,
    image: data,
  });

  // orbit controls for camera movement
  useOrbitControls(canvasRef, cameraRef);

  // click hit-test logs UV coords
  useClickHitTest(canvasRef, cameraRef.current, (uv, e) => {
    console.log('Clicked UV coords:', uv);
  });

  // render loop
  useRenderer({
    regl,
    commands: [draw],
  });

  return (
    <div style={{ position: 'relative', width }}>
      {loading && <p>Loading panorama...</p>}
      {error && <p>Error loading panorama</p>}
      <canvas id="renderer" ref={canvasRef} style={{ width, height }} />
    </div>
  );
};

const meta: Meta<DemoSceneProps> = {
  title: 'DemoScene',
  component: DemoSceneStory,
  argTypes: {
    imageUrl: { control: 'text' },
    width: { control: 'text' },
    height: { control: 'number', min: 100, max: 800, step: 50 },
  },
};
export default meta;

type Story = StoryObj<DemoSceneProps>;
export const Default: Story = {
  args: {
    imageUrl: 'https://astra.camp/images/panorama.jpg',
    width: '100%',
    height: '100%',
  },
};
