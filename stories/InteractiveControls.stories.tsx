import type { Meta, StoryObj } from '@storybook/react';
import { useMemo, useState } from 'react';
import { useLens, equirectangularPano, orbitControls, clickRay } from '../src';

// Sample panorama image
import panoramaUrl from './images/Living_000.png?url';

const InteractiveControls = () => {
  const [clickPosition, setClickPosition] = useState<[number, number, number] | null>(null);
  const [clickCount, setClickCount] = useState(0);

  const plugins = useMemo(() => [
    equirectangularPano({ image: panoramaUrl }),
    orbitControls(),
    clickRay((dir) => {
      setClickPosition(dir);
      setClickCount(prev => prev + 1);
    }),
  ], []);

  const { canvasRef } = useLens({ plugins });

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
      />
      {clickPosition && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: 4,
          fontFamily: 'monospace',
        }}>
          <div>Click #{clickCount}</div>
          <div>Direction: [{clickPosition.map(n => n.toFixed(3)).join(', ')}]</div>
        </div>
      )}
    </div>
  );
};

const meta = {
  title: 'Interactive Controls',
  component: InteractiveControls,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof InteractiveControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {}; 