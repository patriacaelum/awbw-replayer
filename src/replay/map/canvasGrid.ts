import { BASE_SIZE, MAP_PADDING } from "./constants";

export function canvasToGrid(
  offsetX: number,
  offsetY: number,
  mapWidth: number,
  mapHeight: number,
  scaleFactor: number,
): { gx: number; gy: number } | null {
  const cellSize = BASE_SIZE * scaleFactor;
  const gx = Math.floor((offsetX - MAP_PADDING * cellSize) / cellSize);
  const gy = Math.floor((offsetY - MAP_PADDING * cellSize) / cellSize);
  if (gx < 0 || gx >= mapWidth || gy < 0 || gy >= mapHeight) return null;
  return { gx, gy };
}
