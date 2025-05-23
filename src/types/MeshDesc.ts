/**
 * Description of a mesh: positions, UVs, optional indices, and draw primitive
 */
export interface MeshDesc {
  /** XYZ vertex positions */
  positions: Float32Array;
  /** UV coordinates */
  uvs: Float32Array;
  /** Optional triangle indices */
  indices?: Uint16Array;
  /** Draw primitive: 'triangles' or 'triangleStrip' */
  primitive: 'triangles' | 'triangleStrip';
}
