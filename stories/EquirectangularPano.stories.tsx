import type { Meta, StoryObj } from '@storybook/react';
import { orbitControls } from '../src/plugins/interaction/orbitControls';
import { clickRay } from '../src/plugins/interaction/clickRay';
import { equirectangularPano } from '../src/plugins/geometry/equirectangularPano';
import { useImageLoader } from '../src/utils/useImageLoader';
import { useLens } from '../src';
import { useMemo } from 'react';
import livingUrl from './images/Living_000.png?url';

// Props for EquirectangularPano story controlled via Storybook Args
interface EquirectangularPanoProps {
  imageUrl: string;
}

const EquirectangularPanoStory: React.FC<EquirectangularPanoProps> = ({
  imageUrl,
}) => {
  const { data, loading, error } = useImageLoader([livingUrl]);

  const plugins = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    return [
      equirectangularPano({ image: data[0] }),
      orbitControls(),
      clickRay((dir) => console.log(dir)),
    ];
  }, [data]);

  const { canvasRef } = useLens({ plugins });

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
