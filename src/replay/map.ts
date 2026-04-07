import { info, error } from "@tauri-apps/plugin-log";
import { AWBWMapInfo } from "../api_client/awbw";

export type Tile = {
  name: string;
  defence?: number;
  sprite: HTMLImageElement | HTMLImageElement[];
  movementCost?: {
    lightInfantry?: number;
    heavyInfantry?: number;
    tread?: number;
    tire?: number;
    air?: number;
  };
  terrain?: string;
}

// Preload all map textures so Vite can statically include them (dynamic import
// paths don't work)
export const BASE_SIZE = 16;
export const MAP_PADDING = 1;

const TEXTURE_MODULES = import.meta.glob<string>(
  "/src/assets/textures/map/aw2/**/*.png",
  { import: "default" },
);
const PLAIN_TILE_ID = 1;

class TileData {
  [key: number]: Tile;
  private tiles: Map<number, Tile> = new Map();
  private names: Map<string, number> = new Map();

  public set(tileId: number, tile: Tile): void {
    this.tiles.set(tileId, tile);
    this.names.set(tile.name, tileId);
  }

  public get(tileId: number): Tile {
    const tile = this.tiles.get(tileId);

    if (tile === undefined) {
      error(`Tile with id ${tileId} does not exist`);
      throw new Error(`Tile with id ${tileId} does not exist`);
    }

    return tile;
  }

  public getTileIdByName(name: string): number {
    const tileId = this.names.get(name);

    if (tileId === undefined) {
      error(`Tile with name ${name} does not exist`);
      throw new Error(`Tile with name ${name} does not exist`);
    }

    return tileId;
  }
}

/** Maps are drawn with padding of one tile around the perimeter so that the
  * building sprites are not cut off.
  * @param scaleFactor - Scale factor for tile size (default 2).
  *   Cell size = BASE_SIZE * scaleFactor.
  */
export async function drawMap(
  canvas: HTMLCanvasElement,
  mapData: AWBWMapInfo,
  scaleFactor: number = 2,
): Promise<{
  tileData: TileData;
  mapWidth: number;
  mapHeight: number;
}> {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Failed to get canvas context");
  }

  const tileData = await loadTileData();
  const plainTile = tileData.get(PLAIN_TILE_ID);
  const map = mapData["Terrain Map"];

  // Number of cells
  const width = mapData["Size X"];
  const height = mapData["Size Y"];
  const cellSize = BASE_SIZE * scaleFactor;

  canvas.width = (width + 2 * MAP_PADDING) * cellSize;
  canvas.height = (height + 2 * MAP_PADDING) * cellSize;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let tileId = map[x][y];
      tileId = getCorrectedTileId(tileData, tileId, map, x, y);
      const tile = tileData.get(tileId);

      // Draw the plain tile first for buildings to be drawn on top
      drawTile(context, plainTile, x, y, scaleFactor);

      if (tile.terrain === "mountain") {
        const tileNorthId = map[x][Math.max(y - 1, 0)];
        const tileNorth = tileData.get(tileNorthId);
        const shortenMountain = (
          tileNorth.terrain !== "mountain"
            && tileNorth.terrain !== "sea"
            && tileNorth.terrain !== "shoal"
            && tileNorth.terrain !== "plain"
        )

        if (shortenMountain) {
          let img = tile.sprite;
          if (Array.isArray(img)) img = img[0];
          drawTile(context, tile, x, y, scaleFactor, cellSize / img.naturalHeight);
        } else {
          drawTile(context, tile, x, y, scaleFactor);
        }
      } else {
        drawTile(context, tile, x, y, scaleFactor);
      }

    }
  }

  return { tileData, mapWidth: width, mapHeight: height};
}

/** Convert canvas-relative pixel coords to grid cell. Returns null if outside map. */
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

/** Draw a tile at a grid position (for overlay/cursor). Use same scaleFactor as drawMap. */
export function drawTileAtGrid(
  context: CanvasRenderingContext2D,
  tile: Tile,
  gx: number,
  gy: number,
  scaleFactor: number,
): void {
  const cellSize = BASE_SIZE * scaleFactor;
  let img = tile.sprite;
  if (Array.isArray(img)) img = img[0];
  context.save();
  context.drawImage(
    img,
    MAP_PADDING * cellSize + gx * cellSize + (cellSize - img.naturalWidth * scaleFactor) / 2,
    MAP_PADDING * cellSize + gy * cellSize + (cellSize - img.naturalHeight * scaleFactor) / 2,
    img.naturalWidth * scaleFactor,
    img.naturalHeight * scaleFactor,
  );
  context.restore();
}

function drawTile(
  context: CanvasRenderingContext2D,
  tile: Tile,
  x: number,
  y: number,
  scaleFactor: number,
  scaleFactorY: number | null = null,
): void {
  const cellSize = BASE_SIZE * scaleFactor;
  const scaleFactorX = scaleFactor;
  scaleFactorY = scaleFactorY ? scaleFactorY : scaleFactor;
  let img = tile.sprite;

  if (Array.isArray(img)) {
    img = img[0];
  }

  // x = padding + grid_x + (cellWidth - imageWidth)
  context.drawImage(
    img,
    MAP_PADDING * cellSize + x * cellSize + (cellSize - img.naturalWidth * scaleFactorX),
    MAP_PADDING * cellSize + y * cellSize + (cellSize - img.naturalHeight * scaleFactorY),
    img.naturalWidth * scaleFactorX,
    img.naturalHeight * scaleFactorY,
  );
}

function getTextureLoader(name: string): (() => Promise<string>) | null {
  const staticName = `/src/assets/textures/map/aw2/${name}.png`;
  const animatedName = `/src/assets/textures/map/aw2/${name}_0.png`;

  if (TEXTURE_MODULES[staticName]) {
    return () => TEXTURE_MODULES[staticName]();
  }

  if (TEXTURE_MODULES[animatedName]) {
    return () => TEXTURE_MODULES[animatedName]();
  }

  return null;
}

/** Corrects the tile ID for shoal and sea tiles.
 *
 * The tile ID of the shoal and sea tiles don't actually matter because the
 * sprite used is determined by the tiles that surround it.
 *
 * Shoal tiles are defined by the tiles directly north, east, south, and west
 * of it, and whether they are land (l), sea or river (c), or shoal (s)
 * terrain. The filename for shoal tiles is thus formatted as::
 *
 * `shoal_<n><e><s><w>`
 *
 * Sea tiles are defined by all eight surrounding tiles, and whether they are
 * land tiles (l), or sea or river or shoal (c). The filename for sea tiles is
 * thus formatted as::
 *
 * `sea_<n><ne><e><se><s><sw><w><nw>`
 * 
 * @param tileData 
 * @param tileId 
 * @returns 
 */
function getCorrectedTileId(
  tileData: TileData,
  tileId: number,
  map: number[][],
  x: number,
  y: number,
): number {
  const tile = tileData.get(tileId);

  if (tile.terrain === "shoal") {
    return tileData.getTileIdByName(
      "shoal_" + getTerrainSuffix(map, x, y, tileData, true),
    );
  } else if (tile.terrain === "sea") {
    if (tile.name === "reef") {
      return tileId;
    }

    return tileData.getTileIdByName(
      "sea_" + getTerrainSuffix(map, x, y, tileData, false),
    );
  }

  return tileId;
}

/** Shoals should exclude diagonals, and sea tiles should include diagonals.
  */
function getTerrainSuffix(
  map: number[][],
  x: number,
  y: number,
  tileData: TileData,
  excludeDiagonals: boolean,
): string {
  let suffix = "";

  if (excludeDiagonals) {
    // Shoals
    // North
    if (y - 1 < 0) {
      suffix += "c";
    } else {
      const tileId = map[x][y-1];
      const terrain = tileData.get(tileId).terrain;
      suffix += getTerrainSuffixCharacter(terrain, false);
    }

    // East
    if (x + 1 >= map.length) {
      suffix += "c";
    } else {
      const tileId = map[x+1][y];
      const terrain = tileData.get(tileId).terrain;
      suffix += getTerrainSuffixCharacter(terrain, false);
    }

    // South
    if (y + 1 >= map[x].length) {
      suffix += "c";
    } else {
      const tileId = map[x][y+1];
      const terrain = tileData.get(tileId).terrain;
      suffix += getTerrainSuffixCharacter(terrain, false);
    }

    // West
    if (x - 1 < 0) {
      suffix += "c";
    } else {
      const tileId = map[x-1][y];
      const terrain = tileData.get(tileId).terrain;
      suffix += getTerrainSuffixCharacter(terrain, false);
    }
  } else {
    // Sea
    let north: string | undefined = "sea";
    let east: string | undefined = "sea";
    let south: string | undefined = "sea";
    let west: string | undefined = "sea";

    if (y - 1 >= 0) {
      north = tileData.get(map[x][y-1]).terrain;
    }
    if (x + 1 < map.length) {
      east = tileData.get(map[x+1][y]).terrain;
    }
    if (y + 1 < map[x].length) {
      south = tileData.get(map[x][y+1]).terrain;
    }
    if (x - 1 >= 0) {
      west = tileData.get(map[x-1][y]).terrain;
    }

    // North
    if (y - 1 < 0) {
      suffix += "c";
    } else {
      suffix += getTerrainSuffixCharacter(north, true);
    }

    // North-East
    if (y - 1 >= 0 && getTerrainSuffixCharacter(north, true) === "l") {
      suffix += "l";
    } else if (x + 1 < map.length && getTerrainSuffixCharacter(east, true) === "l") {
      suffix += "l";
    } else if (x + 1 >= map.length || y - 1 < 0) {
      suffix += "c";
    } else {
      const tileId = map[x+1][y-1];
      const terrain = tileData.get(tileId).terrain;
      suffix += getTerrainSuffixCharacter(terrain, true);
    }

    // East
    if (x + 1 >= map.length) {
      suffix += "c";
    } else {
      suffix += getTerrainSuffixCharacter(east, true);
    }
    
    // South-East
    if (x + 1 < map.length && getTerrainSuffixCharacter(east, true) === "l") {
      suffix += "l";
    } else if (y + 1 < map[x].length && getTerrainSuffixCharacter(south, true) === "l") {
      suffix += "l";
    } else if (x + 1 >= map.length || y + 1 >= map[x].length) {
      suffix += "c";
    } else {
      const tileId = map[x+1][y+1];
      const terrain = tileData.get(tileId).terrain;
      suffix += getTerrainSuffixCharacter(terrain, true);
    }

    // South
    if (y + 1 >= map[x].length) {
      suffix += "c";
    } else {
      suffix += getTerrainSuffixCharacter(south, true);
    }

    // South-West
    if (y + 1 < map[x].length && getTerrainSuffixCharacter(south, true) === "l") {
      suffix += "l";
    } else if (x - 1 >= 0 && getTerrainSuffixCharacter(west, true) === "l") {
      suffix += "l";
    } else if (x - 1 < 0 || y + 1 >= map[x].length) {
      suffix += "c";
    } else {
      const tileId = map[x-1][y+1];
      const terrain = tileData.get(tileId).terrain;
      suffix += getTerrainSuffixCharacter(terrain, true);
    }

    // West
    if (x - 1 < 0) {
      suffix += "c";
    } else {
      suffix += getTerrainSuffixCharacter(west, true);
    }

    // North-West
    if (x - 1 >= 0 && getTerrainSuffixCharacter(west, true) === "l") {
      suffix += "l";
    } else if (y - 1 >= 0 && getTerrainSuffixCharacter(north, true) === "l") {
      suffix += "l";
    } else if (x - 1 < 0 || y - 1 < 0) {
      suffix += "c";
    } else {
      const tileId = map[x-1][y-1];
      const terrain = tileData.get(tileId).terrain;
      suffix += getTerrainSuffixCharacter(terrain, true);
    }
  }

  return suffix;
}

function getTerrainSuffixCharacter(
  terrain: string | undefined,
  shoalIsSea: boolean,
): string {
  if (terrain === "sea" || terrain === "river") {
    return "c";
  } else if (terrain === "shoal" || terrain === "bridge") {
    if (shoalIsSea) {
      return "c";
    } else {
      return "s";
    }
  } else {
    return "l";
  }
}

async function loadTileData(): Promise<TileData> {
  info("Loading tileset...");

  const response = await fetch("/config/tiles.json");
  const tileJSON = await response.json();
  const tileData = new TileData();

  for (const tileId in tileJSON) {
    const tile = tileJSON[tileId];
    const name = tile.name;
    const loader = getTextureLoader(name);

    if (loader == null) {
      error(`No texture found for tile ${tileId} (name: ${name})`);
      continue;
    }

    const url = await loader();
    const img = await loadImage(url);
    tile.sprite = img;

    tileData.set(Number.parseInt(tileId), tile);
  }

  info("Successfully loaded tileset");

  return tileData;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}
