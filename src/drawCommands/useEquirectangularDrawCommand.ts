import { useMemo } from 'react';
import type { Regl, DrawCommand } from 'regl';

import { useSphereMesh } from '../meshes/useSphereMesh';
import { getProjectionMatrix, getViewMatrix } from '../utils/matrix';
import type { CameraState } from '../types/CameraState';
import type { Shader } from '../types/Shader';
import { noOpDrawCommand } from '../utils/noOpDrawCommand';

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

export interface EquirectangularDrawConfigOptions {
  /** Regl instance used to create draw commands */
  regl: Regl | null;
  /** Ref to the canvas element where Regl renders */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Ref to the current camera state (yaw, pitch, fov) */
  cameraRef: React.RefObject<CameraState>;
  /** ImageBitmap for the panorama; if omitted, rendering is skipped */
  image?: ImageBitmap;
  /** Latitude subdivisions of the sphere mesh (default: 40) */
  latBands?: number;
  /** Longitude subdivisions of the sphere mesh (default: 60) */
  longBands?: number;
}

/**
 * Hook that creates a Regl DrawCommand for rendering an equirectangular panorama on a sphere.
 *
 * @param options DrawConfig options
 * @returns A Regl DrawCommand to render the panorama
 */
export function useEquirectangularDrawCommand({
  regl,
  canvasRef,
  cameraRef,
  image,
  latBands = 40,
  longBands = 60,
}: EquirectangularDrawConfigOptions): DrawCommand {
  // build sphere mesh (always call hook)
  const mesh = useSphereMesh(latBands, longBands);

  return useMemo<DrawCommand>(() => {
    // skip if no image or no canvas
    if (!regl || !canvasRef.current || !image) {
      // return a no‐op command
      return noOpDrawCommand;
    }

    const { width, height } = canvasRef.current;
    const panoTex = regl.texture({ data: image as any });

    return regl({
      vert: latLongShader.vert,
      frag: latLongShader.frag,
      attributes: { aPosition: mesh.positions, aUV: mesh.uvs },
      elements: mesh.indices,
      uniforms: {
        texture: panoTex,
        uProjection: () =>
          getProjectionMatrix(cameraRef.current.fov, width / height),
        uView: () =>
          getViewMatrix(cameraRef.current.yaw, cameraRef.current.pitch),
      },
      depth: { enable: true },
      primitive: mesh.indices ? 'triangles' : 'triangle strip',
    });
    // update if mesh, image, canvas size, or band counts change
  }, [regl, canvasRef.current, image, mesh, cameraRef, latBands, longBands]);
}
