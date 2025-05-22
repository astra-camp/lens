// MaterialProps type for material parameters
export interface MaterialProps {
  vertSrc: string;
  fragSrc: string;
  uniforms?: Record<string, any>;
}
