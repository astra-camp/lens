import React from 'react';

export interface REGLRendererProps
  extends Omit<React.CanvasHTMLAttributes<HTMLCanvasElement>, 'children'> {
  headless?: boolean;
}

export const REGLRenderer: React.FC<REGLRendererProps> = (props) => {
  // ...implementation
  return null;
};
