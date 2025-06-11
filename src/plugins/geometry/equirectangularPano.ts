import { createSphereMesh } from './meshes/sphereMesh';
import type { Shader } from '../../core/types/Shader';
import type { Plugin } from '../../core/types/Plugin';
import { getProjectionMatrix, getViewMatrix } from '../../core/helpers';

const latLongShader: Shader = {
  vert: `
    attribute vec3 aPosition;
    attribute vec2 aUV;
    uniform mat4 uProjection, uView;
    varying vec2 vUV;
    void main() {
      vUV = aUV;
      gl_Position = uProjection * uView * vec4(aPosition, 1.0);
    }`,
  frag: `
    precision mediump float;
    varying vec2 vUV;
    uniform sampler2D texture;
    void main() {
      gl_FragColor = texture2D(texture, vUV);
    }`,
};

export interface EquirectangularPanoProps {
  image: ImageBitmap | null;
  latBands?: number;
  longBands?: number;
}

export function equirectangularPano({
  image,
  latBands,
  longBands,
}: EquirectangularPanoProps): Plugin {
  return (ctx) => {
    const mesh = createSphereMesh(latBands, longBands);

    const { regl, cameraRef, canvasRef } = ctx;

    if (!regl || !canvasRef.current || !image) {
      return ctx;
    }

    const panoTex = regl.texture({ data: image as any });
    const command = regl({
      vert: latLongShader.vert,
      frag: latLongShader.frag,
      attributes: { aPosition: mesh.positions, aUV: mesh.uvs },
      elements: mesh.indices,
      uniforms: {
        texture: panoTex,
        uProjection: () =>
          getProjectionMatrix(cameraRef.current.vFOV, cameraRef.current.aspect),
        uView: () =>
          getViewMatrix(cameraRef.current.yaw, cameraRef.current.pitch),
      },
      depth: { enable: true },
      primitive: mesh.indices ? 'triangles' : 'triangle strip',
    });

    return {
      ...ctx,
      drawCommands: [...ctx.drawCommands, command],
    };
  };
}
