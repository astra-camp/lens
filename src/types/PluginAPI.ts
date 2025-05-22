// PluginAPI types for Lens plugins
import type { LensContextValue } from '../core/context/LensContext';

export interface LensPlugin {
  onInit?: (context: LensContextValue) => void;
  onDestroy?: () => void;
}
