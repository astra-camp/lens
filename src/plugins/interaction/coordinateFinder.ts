import { screenToRay } from '../../utils/matrix';
import { ViewSpaceCoord } from '../../core/types/Coordinates';
import { Plugin } from '../../core/types/Plugin';

interface CoordinateFinderOptions {
  enabled?: boolean;
  showCoordinates?: boolean;
  copyOnClick?: boolean;
  tooltipOffset?: [number, number];
}

export function coordinateFinder(options: CoordinateFinderOptions = {}): Plugin {
  const {
    enabled = true,
    showCoordinates = true,
    copyOnClick = true,
    tooltipOffset = [10, -30]
  } = options;

  return (getState, _, { onSetup, onCleanup }) => {
    let tooltip: HTMLDivElement | null = null;
    let isPointerOver = false;
    let currentCoords: ViewSpaceCoord | null = null;
    let isCopying = false;

    function createTooltip() {
      if (tooltip) return tooltip;
      
      tooltip = document.createElement('div');
      tooltip.style.cssText = `
        position: fixed;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
        pointer-events: none;
        z-index: 1000;
        white-space: nowrap;
        display: none;
      `;
      document.body.appendChild(tooltip);
      return tooltip;
    }

    function updateTooltip(x: number, y: number, coords: ViewSpaceCoord) {
      if (!showCoordinates || !tooltip) return;
      
      const [offsetX, offsetY] = tooltipOffset;
      tooltip.style.left = `${x + offsetX}px`;
      tooltip.style.top = `${y + offsetY}px`;
      tooltip.textContent = `[${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}, ${coords[2].toFixed(6)}]`;
      tooltip.style.display = 'block';
    }

    function hideTooltip() {
      if (tooltip && !isCopying) {
        tooltip.style.display = 'none';
      }
    }

    function copyToClipboard(text: string) {
      if (!copyOnClick) return;
      
      isCopying = true;
      
      navigator.clipboard.writeText(text).then(() => {
        // Show a brief success indicator
        if (tooltip) {
          const originalText = tooltip.textContent;
          const originalBackground = tooltip.style.background;
          tooltip.textContent = 'Copied!';
          tooltip.style.background = 'rgba(0, 128, 0, 0.8)';
          tooltip.style.display = 'block'; // Ensure tooltip is visible
          
          setTimeout(() => {
            if (tooltip) {
              tooltip.textContent = originalText;
              tooltip.style.background = originalBackground;
            }
            isCopying = false;
          }, 1000);
        } else {
          isCopying = false;
        }
      }).catch(err => {
        console.error('Failed to copy coordinates:', err);
        isCopying = false;
      });
    }

    function onPointerMove(e: PointerEvent) {
      if (!enabled) return;
      
      const { canvas, camera } = getState();
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if pointer is over the canvas
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        isPointerOver = true;
        const coords = screenToRay(
          x,
          y,
          rect.width,
          rect.height,
          camera.vFOV,
          camera.yaw,
          camera.pitch
        );
        currentCoords = coords;
        updateTooltip(e.clientX, e.clientY, coords);
      } else {
        isPointerOver = false;
        hideTooltip();
      }
    }

    function onPointerLeave() {
      isPointerOver = false;
      hideTooltip();
    }

    function onPointerClick(e: MouseEvent) {
      if (!enabled || !copyOnClick || !currentCoords) return;
      
      const { canvas } = getState();
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if click is within canvas bounds
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        const coordString = `[${currentCoords[0].toFixed(6)}, ${currentCoords[1].toFixed(6)}, ${currentCoords[2].toFixed(6)}]`;
        
        // Ensure tooltip is visible before copying
        if (tooltip) {
          tooltip.style.display = 'block';
        }
        
        copyToClipboard(coordString);
      }
    }

    // register side-effects in LensContext lifecycle
    onSetup(() => {
      const { canvas } = getState();
      if (!canvas) return;
      
      createTooltip();
      
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerleave', onPointerLeave);
      canvas.addEventListener('click', onPointerClick);
    });
    
    onCleanup(() => {
      const { canvas } = getState();
      if (!canvas) return;
      
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('click', onPointerClick);
      
      if (tooltip) {
        document.body.removeChild(tooltip);
        tooltip = null;
      }
    });

    return {};
  };
} 