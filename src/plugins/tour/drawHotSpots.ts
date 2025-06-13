import { getProjectionMatrix, getViewMatrix } from '../../utils/matrix';
import type { Shader } from '../../core/types/Shader';
import type { HotSpot } from './types';
import type { Plugin } from '../../core/types/Plugin';
import type { LensState } from '../../core/types/LensState';

const pointShader: Shader = {
  vert: `
    precision mediump float;
    attribute vec3 aPosition;
    uniform mat4 uProjection;
    uniform mat4 uView;
    uniform float uPointSize;
    void main() {
      gl_PointSize = uPointSize;
      gl_Position = uProjection * uView * vec4(aPosition, 1.0);
    }
  `,
  frag: `
    precision mediump float;
    uniform vec4 uColor;
    void main() {
      vec2 c = gl_PointCoord * 2.0 - 1.0;
      float r2 = dot(c, c);
      if (r2 > 1.0) {
        discard;
      }
      float r = sqrt(r2);
      float gap = 0.2;               // size/5 relative
      float border = 0.1;            // size/10 relative
      float fillRadius = 1.0 - gap - border;
      float borderStart = 1.0 - border;
      if (r <= fillRadius) {
        gl_FragColor = uColor;
      } else if (r >= borderStart) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      } else {
        discard;
      }
    }
  `,
};

export interface HotSpotDrawOptions {
  hotspots: HotSpot[];
  /** RGBA color of the hotspot */
  color?: [number, number, number, number];
  /** Size in pixels of the hotspot */
  size?: number;
}

export function drawHotSpots({
  hotspots,
  color = [1, 1, 1, 1],
  size = 30,
}: HotSpotDrawOptions): Plugin {
  return (getState) => {

    const { regl } = getState();

    const drawCommand = regl({
      vert: pointShader.vert,
      frag: pointShader.frag,
      attributes: { aPosition: hotspots.map((h) => h.coord) },
      uniforms: {
        uProjection: () => {
          const { camera } = getState();
          return getProjectionMatrix(camera.vFOV, camera.aspect);
        },
        uView: () => {
          const { camera } = getState();
          return getViewMatrix(camera.yaw, camera.pitch)
        },
        uPointSize: ({ pixelRatio }: { pixelRatio: number }) => size * pixelRatio,
        uColor: color,
      },
      count: hotspots.length,
      primitive: 'points',
      depth: { enable: false },
      blend: {
        enable: true,
        func: { src: 'src alpha', dst: 'one minus src alpha' },
      },
    });


    return {
      drawCommands: [...getState().drawCommands, drawCommand]
    };
  };
}
