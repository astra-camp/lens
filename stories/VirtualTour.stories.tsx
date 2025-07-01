import type { Meta, StoryObj } from '@storybook/react';
import { useMemo, useState } from 'react';
import {
  useImageLoader,
  useLens,
  equirectangularPano,
  drawHotSpots,
  hotSpotClick,
  orbitControls,
  coordinateFinder,
  type HotSpot,
} from '../src';

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
        coord: [0.171354, -0.063197, -0.983180],
        linkTo: 'bedroom',
      },
      {
        coord: [0.247295, -0.563549, -0.788199],
        linkTo: 'hall',
      },
      {
        coord: [0.446068, -0.242503, -0.861519],
        linkTo: 'bathroom',
      },
    ] as HotSpot[],
  },
  bedroom: {
    imageUrl: bedroomUrl,
    hotspots: [
      {
        coord: [-0.008295, -0.519876, 0.854202],
        linkTo: 'hall',
      },
      {
        coord: [-0.020365, -0.225596, 0.974008],
        linkTo: 'living',
      },
    ] as HotSpot[],
  },
  hall: {
    imageUrl: hallUrl,
    hotspots: [
      {
        coord: [0.991889, -0.117303, 0.048946],
        linkTo: 'bathroom',
      },
      {
        coord: [-0.038488, -0.133468, 0.990306],
        linkTo: 'living',
      },
      {
        coord: [0.091310, -0.157245, -0.983329],
        linkTo: 'bedroom',
      },
    ] as HotSpot[],
  },
  bathroom: {
    imageUrl: bathroomUrl,
    hotspots: [
      {
        coord: [-0.983526, -0.180553, -0.008747],
        linkTo: 'hall',
      },
    ] as HotSpot[],
  },
};

const VirtualTour = () => {
  const [currentScene, setCurrentScene] = useState<keyof typeof scenes>('living');
  const [showCoordinateFinder, setShowCoordinateFinder] = useState(false);
  
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
    
    const basePlugins = [
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

    // Add coordinate finder if enabled
    if (showCoordinateFinder) {
      basePlugins.push(
        coordinateFinder({
          enabled: true,
          showCoordinates: true,
          copyOnClick: true,
          tooltipOffset: [10, -30],
        })
      );
    }

    return basePlugins;
  }, [currentScene, currentImage, showCoordinateFinder]);

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

      {/* Coordinate Finder Toggle */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: 4,
        fontFamily: 'monospace',
        zIndex: 5,
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <input
            type="checkbox"
            checked={showCoordinateFinder}
            onChange={(e) => setShowCoordinateFinder(e.target.checked)}
            style={{ margin: 0 }}
          />
          Coordinate Finder
        </label>
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