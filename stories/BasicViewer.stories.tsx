import type { Meta, StoryObj } from '@storybook/react';
import { useMemo } from 'react';
import { useLens, equirectangularPano, orbitControls } from '../src';
import { useImageLoader } from '../src/utils/useImageLoader';

// Sample panorama image
import panoramaUrl from './images/Living_000.png?url';

const BasicViewer = () => {
  const { data: images, loading, error } = useImageLoader([panoramaUrl]);
  
  const plugins = useMemo(() => {
    if (!images || images.length === 0) return [];
    
    return [
      equirectangularPano({ image: images[0] }),
      orbitControls(),
    ];
  }, [images]);

  const { canvasRef } = useLens({ plugins });

  if (loading) {
    return <div>Loading panorama...</div>;
  }

  if (error) {
    return <div>Error loading panorama: {error.message}</div>;
  }

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

const meta = {
  title: 'Basic Viewer',
  component: BasicViewer,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof BasicViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {}; 