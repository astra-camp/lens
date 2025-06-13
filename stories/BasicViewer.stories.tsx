import type { Meta, StoryObj } from '@storybook/react';
import { useMemo } from 'react';
import { useLens, equirectangularPano, orbitControls } from '../src';

// Sample panorama image
import panoramaUrl from './images/Living_000.png?url';

const BasicViewer = () => {
  const plugins = useMemo(() => [
    equirectangularPano({ image: panoramaUrl }),
    orbitControls(),
  ], []);

  const { canvasRef } = useLens({ plugins });

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