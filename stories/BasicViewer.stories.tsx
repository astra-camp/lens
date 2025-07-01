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

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          fontSize: '18px',
          zIndex: 10,
        }}>
          Loading...
        </div>
      )}
      
      {/* Error overlay */}
      {error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'red',
          fontSize: '18px',
          zIndex: 10,
        }}>
          Error: {error.message}
        </div>
      )}
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