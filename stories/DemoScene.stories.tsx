import type { Meta, StoryObj } from '@storybook/react';
import { useState, useMemo } from 'react';
import {
  useHotSpotDrawCommands,
  useHotSpotClick,
  Scene,
} from '../src/plugins/tour';

import livingUrl from './images/Living_000.png?url';
import bedroomUrl from './images/Bedroom_000.png?url';
import hallUrl from './images/Hall_000.png?url';
import bathroomUrl from './images/Bathroom_000.png?url';

const scenes: Scene[] = [
  {
    id: 'living',
    imageUrl: livingUrl,
    hotSpots: [
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
    ],
  },
  {
    id: 'bedroom',
    imageUrl: bedroomUrl,
    hotSpots: [
      {
        coord: [-0.10512484610080719, -0.5808870792388916, 0.8071672320365906],
        linkTo: 'hall',
      },
      {
        coord: [-0.06090390682220459, -0.140432208776474, 0.9882153272628784],
        linkTo: 'living',
      },
    ],
  },
  {
    id: 'hall',
    imageUrl: hallUrl,
    hotSpots: [
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
    ],
  },
  {
    id: 'bathroom',
    imageUrl: bathroomUrl,
    hotSpots: [
      {
        coord: [0.04071690887212753, -0.2330167591571808, -0.9716199636459351],
        linkTo: 'hall',
      },
    ],
  },
];

// Props for DemoScene story controlled via Storybook Args
interface DemoSceneProps {
  imageUrl: string;
}

const DemoSceneStory: React.FC<DemoSceneProps> = ({ imageUrl }) => {
  return <div />;

  // const [sceneIndex, setSceneIndex] = useState<number>(0);

  // const currentScene = useMemo(() => {
  //   return scenes[sceneIndex];
  // }, [sceneIndex]);

  // const { regl, cameraRef, canvasRef } = useLensScaffold();

  // const { data, loading, error } = useImageLoader(
  //   scenes.map((scene) => scene.imageUrl)
  // );

  // const { mesh, mapDirToUV } = useSphereMesh();

  // // draw config with custom subdivisions
  // const drawPano = useEquirectangularDrawCommand({
  //   regl,
  //   canvasRef,
  //   cameraRef,
  //   mesh,
  //   image: data && data[sceneIndex],
  // });

  // const drawHotSpot = useHotSpotDrawCommands({
  //   regl,
  //   canvasRef,
  //   cameraRef,
  //   hotspots: currentScene.hotSpots,
  //   size: 30,
  // });

  // // render loop
  // useRenderer({
  //   regl,
  //   commands: [drawPano, drawHotSpot],
  // });

  // // orbit controls for camera movement
  // useOrbitControls(canvasRef, cameraRef);

  // // click ray for hit testing
  // useClickRay(canvasRef, cameraRef, (dir, e) => {
  //   console.log('Clicked direction:', dir, 'Event:', e);
  // });

  // useHotSpotClick(canvasRef, cameraRef, currentScene.hotSpots, (hotspot) => {
  //   console.log('Hotspot clicked:', hotspot);
  //   const nextSceneIndex = scenes.findIndex(
  //     (scene) => scene.id === hotspot.linkTo
  //   );
  //   if (nextSceneIndex !== -1) {
  //     setSceneIndex(nextSceneIndex);
  //   }
  // });

  // return (
  //   <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
  //     {loading && <p>Loading panorama...</p>}
  //     {error && <p>Error loading panorama</p>}
  //     <canvas
  //       id="renderer"
  //       ref={canvasRef}
  //       style={{
  //         position: 'absolute',
  //         top: 0,
  //         left: 0,
  //         width: '100%',
  //         height: '100%',
  //       }}
  //     />
  //   </div>
  // );
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
