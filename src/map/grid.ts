import { BASE_SIZE, MAP_PADDING } from "./constants";
import { Vector2 } from "../types";

/** Returns the grid coordinates of a mouse event.
 *  Returns `null` if the mouse event is outside of the canvas.
 */
export function mouseEventToGrid(
  canvas: HTMLCanvasElement,
  e: MouseEvent,
  mapSize: Vector2,
  scale: number,
): Vector2 | null {
  const canvasPosition = {
    x: e.clientX - canvas.clientLeft,
    y: e.clientY - canvas.clientTop,
  };

  return canvasToGrid(canvasPosition, mapSize, scale);
}

/** Returns the grid coordinates from the global canvas coordinates.
 *  Returns `null` if the coordinates are outside of the map size.
 */
function canvasToGrid(
  canvasPosition: Vector2,
  mapSize: Vector2,
  scale: number,
): Vector2 | null {
  const cellSize = BASE_SIZE * scale;
  const gx = Math.floor(
    (canvasPosition.x - MAP_PADDING * cellSize) / cellSize
  );
  const gy = Math.floor(
    (canvasPosition.y - MAP_PADDING * cellSize) / cellSize
  );

  if (gx < 0 || gx >= mapSize.x || gy < 0 || gy >= mapSize.y) {
    return null;
  }

  return { x: gx, y: gy };
}
