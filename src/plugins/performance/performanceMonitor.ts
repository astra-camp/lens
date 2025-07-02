import type { Plugin } from '../../core/types/Plugin';
import type { FrameContext } from '../../core/types/FrameContext';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
  drawCalls: number;
}

export interface PerformanceMonitorOptions {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  fontSize?: number;
  backgroundColor?: string;
  textColor?: string;
  padding?: number;
  showMemory?: boolean;
  updateInterval?: number; // How often to update the display (in frames)
}

const defaultOptions: Required<PerformanceMonitorOptions> = {
  enabled: true,
  position: 'top-left',
  fontSize: 12,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  textColor: '#ffffff',
  padding: 8,
  showMemory: true,
  updateInterval: 30, // Update every 30 frames
};

export function performanceMonitor(options: PerformanceMonitorOptions = {}): Plugin {
  const opts = { ...defaultOptions, ...options };
  
  let overlay: HTMLDivElement | null = null;
  let fpsHistory: number[] = [];
  let frameTimeHistory: number[] = [];
  let lastUpdateFrame = 0;
  
  const maxHistoryLength = 60; // Keep 60 frames of history for averaging
  
  function createOverlay(): HTMLDivElement {
    const div = document.createElement('div');
    Object.assign(div.style, {
      position: 'absolute',
      fontFamily: 'monospace',
      fontSize: `${opts.fontSize}px`,
      color: opts.textColor,
      backgroundColor: opts.backgroundColor,
      padding: `${opts.padding}px`,
      borderRadius: '4px',
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: '1000',
      whiteSpace: 'pre',
      lineHeight: '1.2',
    });
    
    // Position the overlay
    switch (opts.position) {
      case 'top-right':
        div.style.top = '10px';
        div.style.right = '10px';
        break;
      case 'bottom-left':
        div.style.bottom = '10px';
        div.style.left = '10px';
        break;
      case 'bottom-right':
        div.style.bottom = '10px';
        div.style.right = '10px';
        break;
      default: // top-left
        div.style.top = '10px';
        div.style.left = '10px';
    }
    
    return div;
  }
  
  function updateOverlay(metrics: PerformanceMetrics) {
    if (!overlay) return;
    
    let text = `FPS: ${metrics.fps.toFixed(1)}\n`;
    text += `Frame: ${metrics.frameTime.toFixed(1)}ms\n`;
    text += `Draw Calls: ${metrics.drawCalls}\n`;
    
    if (opts.showMemory && metrics.memoryUsage) {
      const usedMB = metrics.memoryUsage.used / (1024 * 1024);
      const totalMB = metrics.memoryUsage.total / (1024 * 1024);
      const limitMB = metrics.memoryUsage.limit / (1024 * 1024);
      text += `Memory: ${usedMB.toFixed(1)}MB / ${totalMB.toFixed(1)}MB\n`;
      text += `Limit: ${limitMB.toFixed(1)}MB\n`;
    }
    
    overlay.textContent = text;
  }
  
  function getMemoryUsage(): PerformanceMetrics['memoryUsage'] {
    const perf = window.performance as any;
    if (perf && perf.memory && typeof perf.memory.usedJSHeapSize === 'number') {
      return {
        used: perf.memory.usedJSHeapSize,
        total: perf.memory.totalJSHeapSize,
        limit: perf.memory.jsHeapSizeLimit,
      };
    }
    return undefined;
  }
  
  function calculateAverage(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }
  
  return (getState, _setState, registerCallbacks) => {
    registerCallbacks.onSetup(() => {
      if (!opts.enabled) return;
      
      overlay = createOverlay();
      document.body.appendChild(overlay);
    });
    
    registerCallbacks.onCleanup(() => {
      if (overlay) {
        document.body.removeChild(overlay);
        overlay = null;
      }
    });
    
    registerCallbacks.onFrame((frameCtx: FrameContext) => {
      if (!opts.enabled || !overlay) return;
      
      // Use dt from FrameContext (dt is in seconds)
      const dt = frameCtx.dt;
      if (dt > 0) {
        const fps = 1 / dt;
        const frameTime = dt * 1000;
        fpsHistory.push(fps);
        frameTimeHistory.push(frameTime);
        // Keep history within bounds
        if (fpsHistory.length > maxHistoryLength) {
          fpsHistory.shift();
          frameTimeHistory.shift();
        }
      }
      // Update display periodically
      if (frameCtx.tick - lastUpdateFrame >= opts.updateInterval) {
        const state = getState();
        const metrics: PerformanceMetrics = {
          fps: calculateAverage(fpsHistory),
          frameTime: calculateAverage(frameTimeHistory),
          memoryUsage: getMemoryUsage(),
          drawCalls: state.drawCommands.length,
        };
        updateOverlay(metrics);
        lastUpdateFrame = frameCtx.tick;
      }
    });
    
    return {};
  };
} 