import { drawTile } from "../../map/draw";
import { getCorrectedTileId } from "../../tile/terrainSuffix";
import { TileData } from "../../tile/tile_data";
import type { Tile } from "./types";

export function drawMapCell(
  context: CanvasRenderingContext2D,
  tileData: TileData,
  plainTile: Tile,
  map: number[][],
  x: number,
  y: number,
  scaleFactor: number,
  cellSize: number,
): void {
  let tileId = map[x][y];
  tileId = getCorrectedTileId(tileData, tileId, map, x, y);
  const tile = tileData.get(tileId);
  drawTile(context, plainTile, { x, y }, { x: scaleFactor, y: scaleFactor });
  if (tile.terrain === "mountain") {
    drawMountainTile(context, tileData, tile, map, x, y, scaleFactor, cellSize);
  } else {
    drawTile(context, tile, { x, y }, { x: scaleFactor, y: scaleFactor });
  }
}

function drawMountainTile(
  context: CanvasRenderingContext2D,
  tileData: TileData,
  tile: Tile,
  map: number[][],
  x: number,
  y: number,
  scaleFactor: number,
  cellSize: number,
): void {
  const tileNorth = tileData.get(map[x][Math.max(y - 1, 0)]);
  const shortenMountain =
    tileNorth.terrain !== "mountain" &&
    tileNorth.terrain !== "sea" &&
    tileNorth.terrain !== "shoal" &&
    tileNorth.terrain !== "road" &&
    tileNorth.terrain !== "plain";
  if (!shortenMountain) {
    drawTile(context, tile, { x, y }, { x: scaleFactor, y: scaleFactor });
    return;
  }
  let img = tile.sprite;
  if (Array.isArray(img)) img = img[0];
  const scaleY = cellSize / img.naturalHeight;
  drawTile(context, tile, { x, y }, { x: scaleFactor, y: scaleY });
}
