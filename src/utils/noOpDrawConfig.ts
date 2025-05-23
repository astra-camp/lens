import { DrawConfig } from 'regl';

export const noOpDrawConfig: DrawConfig = {
  vert: `
    precision highp float;
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `,
  frag: `
    #ifdef GL_ES
    precision mediump float;
    #endif
    void main() {
      // nothing drawn
    }
  `,
  attributes: {
    position: new Float32Array([0,0]), // just a placeholder
  },
  count: 1,
  uniforms: {},
  elements: [],
};
