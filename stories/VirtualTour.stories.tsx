import type { Meta, StoryObj } from '@storybook/react';
import { useMemo, useState } from 'react';
import {
  useLens,
  equirectangularPano,
  drawHotSpots,
  hotSpotClick,
  orbitControls,
  type HotSpot,
} from '../src';
import { useImageLoader } from '../src/utils/useImageLoader';

// Sample panorama images
import livingUrl from './images/Living_000.png?url';
import bedroomUrl from './images/Bedroom_000.png?url';
import hallUrl from './images/Hall_000.png?url';
import bathroomUrl from './images/Bathroom_000.png?url';

const scenes = {
  living: {
    imageUrl: livingUrl,
    hotspots: [
      {
        coord: [-0.9943646192550659, -0.05175129696726799, 0.09252454340457916],
        linkTo: 'bedroom',
      },
      {
        coord: [-0.8604172468185425, -0.5092486143112183, 0.01865598000586033],
        linkTo: 'hall',
      },
      {
        coord: [-0.9633703827857971, -0.2169598937034607, -0.15762574970722198],
        linkTo: 'bathroom',
      },
    ] as HotSpot[],
  },
  bedroom: {
    imageUrl: bedroomUrl,
    hotspots: [
      {
        coord: [-0.10512484610080719, -0.5808870792388916, 0.8071672320365906],
        linkTo: 'hall',
      },
      {
        coord: [-0.06090390682220459, -0.140432208776474, 0.9882153272628784],
        linkTo: 'living',
      },
    ] as HotSpot[],
  },
  hall: {
    imageUrl: hallUrl,
    hotspots: [
      {
        coord: [-0.9209504127502441, -0.3753415644168854, -0.1047329381108284],
        linkTo: 'bathroom',
      },
      {
        coord: [0.017078520730137825, -0.4127347767353058, -0.9106911420822144],
        linkTo: 'living',
      },
      {
        coord: [-0.08906751871109009, -0.3641025722026825, 0.9270902276039124],
        linkTo: 'bedroom',
      },
    ] as HotSpot[],
  },
  bathroom: {
    imageUrl: bathroomUrl,
    hotspots: [
      {
        coord: [0.04071690887212753, -0.2330167591571808, -0.9716199636459351],
        linkTo: 'hall',
      },
    ] as HotSpot[],
  },
};

const VirtualTour = () => {
  const [currentScene, setCurrentScene] = useState<keyof typeof scenes>('living');
  
  // Lazy load only the current scene's image
  const { data: images, loading, error } = useImageLoader([scenes[currentScene].imageUrl]);
  const currentImage = images?.[0];

  // Create plugins that depend on the current scene and image
  const plugins = useMemo(() => {
    // If no image is loaded yet, return minimal plugins
    if (!currentImage) {
      return [];
    }

    const currentSceneData = scenes[currentScene];
    
    return [
      equirectangularPano({ image: currentImage }),
      orbitControls(),
      drawHotSpots({
        hotspots: currentSceneData.hotspots,
        color: [1, 1, 1, 0.8],
        size: 30,
      }),
      hotSpotClick(
        currentSceneData.hotspots,
        (hotspot) => {
          setCurrentScene(hotspot.linkTo as keyof typeof scenes);
        }
      ),
    ];
  }, [currentScene, currentImage]);

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
          Loading {currentScene}...
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
          Error loading {currentScene}: {error.message}
        </div>
      )}
      
      {/* Room indicator */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: 4,
        fontFamily: 'monospace',
        zIndex: 5,
      }}>
        Current Room: {currentScene.charAt(0).toUpperCase() + currentScene.slice(1)}
      </div>
    </div>
  );
};

const meta = {
  title: 'Virtual Tour',
  component: VirtualTour,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof VirtualTour>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {}; 