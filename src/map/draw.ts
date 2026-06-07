import { info } from "@tauri-apps/plugin-log";
import { BASE_SIZE, MAP_PADDING, PLAIN_TILE_ID } from "./constants";
import { TileData } from "../tile/tile_data";
import { requireContext } from "../canvas";
import type { AWBWMapInfo } from "../api_client";
import type { Tile } from "../tile/types";
import type { Vector2 } from "../types";

/** Maps are drawn with padding of one tile around the perimeter so that the
 * building sprites are not cut off. Cell size = BASE_SIZE * scaleFactor. 
 */
export async function drawMap(
  canvas: HTMLCanvasElement,
  mapData: AWBWMapInfo,
  scaleFactor: number,
): Promise<{ tileData: TileData; mapSize: Vector2; }> {
  const context = requireContext(canvas);
  const tileData = new TileData();
  await tileData.loadTiles();
  const mapSize = { x: mapData["Size X"], y: mapData["Size Y"] };
  const cellSize = BASE_SIZE * scaleFactor;

  canvas.width = (mapSize.x + 2 * MAP_PADDING) * cellSize;
  canvas.height = (mapSize.y + 2 * MAP_PADDING) * cellSize;

  fillGrid(context, tileData.get(PLAIN_TILE_ID), mapSize, scaleFactor);

  for (let x = 0; x < mapData["Size X"]; x++) {
    for (let y = 0; y < mapData["Size Y"]; y++) {
      const tile = tileData.getVariation(mapData["Terrain Map"], { x, y });

      if (tile.terrain === "mountain" && shortenTile(tileData, mapData["Terrain Map"], x, y)) {
        let sprite = tile.sprite;
        if (Array.isArray(sprite)) sprite = sprite[0];
        const scaleY = BASE_SIZE * scaleFactor / sprite.naturalHeight;
        drawTile(context, tile, { x, y }, { x: scaleFactor, y: scaleY });
      } else {
        drawTile(context, tile, { x, y }, { x: scaleFactor, y: scaleFactor });
      }
    }
  }

  info(`Successfully drew map ${mapData.Name}`);
 
  return { tileData, mapSize };
}

function shortenTile(tileData: TileData, map: number[][], x: number, y: number): boolean {
  const tileNorth = tileData.get(map[x][Math.max(y - 1, 0)]);
  const shortenTiles = ["city", "base", "airport", "port", "hq", "silo", "com_tower", "lab"];

  if (tileNorth.terrain && shortenTiles.includes(tileNorth.terrain)) {
    return true;
  }

  return false;
}

/** Draws a tile at the global xy coordinates of the canvas.
 *  If only one scale factor is provided, then the tile will be scaled
 *  uniformly. The map padding is taken into account.
 */
export function drawTile(
  context: CanvasRenderingContext2D,
  tile: Tile,
  position: Vector2,
  scale: Vector2
): void {
  const cellSize = BASE_SIZE * scale.x;

  let img = tile.sprite;
  if (Array.isArray(img)) img = img[0];

  context.drawImage(
    img,
    MAP_PADDING * cellSize
      + position.x * cellSize
      + (cellSize - img.naturalWidth * scale.x),
    MAP_PADDING * cellSize
      + position.y * cellSize
      + (cellSize - img.naturalHeight * scale.y),
    img.naturalWidth * scale.x,
    img.naturalHeight * scale.y,
  );
}

/** Draws a tile at the xy map coordinates of the canvas.
 *  The map padding is taken into account.
 */
export function drawTileAtGrid(
  context: CanvasRenderingContext2D,
  tile: Tile,
  position: Vector2,
  scaleFactor: number,
): void {
  const cellSize = BASE_SIZE * scaleFactor;

  let img = tile.sprite;
  if (Array.isArray(img)) img = img[0];

  context.save();
  context.drawImage(
    img,
    MAP_PADDING * cellSize
      + position.x * cellSize
      + (cellSize - img.naturalWidth * scaleFactor) / 2,
    MAP_PADDING * cellSize
      + position.y * cellSize
      + (cellSize - img.naturalHeight * scaleFactor) / 2,
    img.naturalWidth * scaleFactor,
    img.naturalHeight * scaleFactor,
  );
  context.restore();
}

/** Fills the canvas grid with the tile. */
function fillGrid(
  context: CanvasRenderingContext2D,
  tile: Tile,
  mapSize: Vector2,
  scaleFactor: number,
): void {
  for (let x = 0; x < mapSize.x; x++) {
    for (let y = 0; y < mapSize.y; y++) {
      drawTileAtGrid(context, tile, { x: x, y: y }, scaleFactor);
    }
  }
}
