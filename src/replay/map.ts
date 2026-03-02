import { info, error } from "@tauri-apps/plugin-log";
import { AWBWMapInfo } from "../api_client/awbw";

type TileData = {
  [key: number]: Tile;
}
type Tile = {
  name: string;
  defence: number;
  sprite: HTMLImageElement | HTMLImageElement[];
  movementCost: {
    lightInfantry: number;
    heavyInfantry: number;
    tread: number;
    tire: number;
    air: number;
  };
  terrain: string;
}

// Preload all map textures so Vite can statically include them (dynamic import
// paths don't work)
const TEXTURE_MODULES = import.meta.glob<string>(
  "/src/assets/textures/map/aw2/**/*.png",
  { import: "default" },
);
const PLAIN_TILE_ID = 1;
const BASE_SIZE = 16;
const MAP_PADDING = 1;

/** Maps are drawn with padding of one tile around the perimeter so that the
  * building sprites are not cut off.
  */
export async function drawMap(
  canvas: HTMLCanvasElement,
  mapData: AWBWMapInfo,
): Promise<void> {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Failed to get canvas context");
  }

  const tileData = await loadTileData();

  // Number of cells
  const width = mapData["Size X"];
  const height = mapData["Size Y"];

  // Defining cell size and how to scale
  const scaleFactor = 2;
  canvas.width = (width + 2 * MAP_PADDING) * BASE_SIZE * scaleFactor;
  canvas.height = (height + 2 * MAP_PADDING) * BASE_SIZE * scaleFactor;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const tileId = mapData["Terrain Map"][x][y];
      const tile = tileData[tileId];

      drawTile(context, tileData[PLAIN_TILE_ID], x, y, scaleFactor);
      drawTile(context, tile, x, y, scaleFactor);
    }
  }
}

function drawTile(
  context: CanvasRenderingContext2D,
  tile: Tile,
  x: number,
  y: number,
  scale: number = 1,
): void {
  const cellSize = BASE_SIZE * scale;
  let img = tile.sprite;

  if (Array.isArray(img)) {
    img = img[0];
  }

  // x = padding + grid_x + (cellWidth - imageWidth)
  context.drawImage(
    img,
    MAP_PADDING * cellSize + x * cellSize + (cellSize - img.naturalWidth * scale),
    MAP_PADDING * cellSize + y * cellSize + (cellSize - img.naturalHeight * scale),
    img.naturalWidth * scale,
    img.naturalHeight * scale,
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

async function loadTileData(): Promise<TileData> {
  info("Loading tileset...");

  const response = await fetch("/config/tiles.json");
  const tileData = await response.json();

  for (const tileId in tileData) {
    const name = tileData[tileId].name;
    const loader = getTextureLoader(name);

    if (loader == null) {
      error(`No texture found for tile ${tileId} (name: ${name})`);
      continue;
    }

    const url = await loader();
    const img = await loadImage(url);
    tileData[tileId].sprite = img;
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
