import { info, error } from "@tauri-apps/plugin-log";
import { AWBWMapInfo } from "../api_client/awbw";

type TileData = {
  [key: number]: {
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
  };
}

// Preload all map textures so Vite can statically include them (dynamic import paths don't work)
const TEXTURE_MODULES = import.meta.glob<string>(
  "/src/assets/textures/map/aw2/**/*.png",
  { import: "default" },
);
const PLAIN_TILE_ID = 1;
const BASE_SIZE = 16;

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
  const cellSize = BASE_SIZE * scaleFactor;
  canvas.width = width * cellSize;
  canvas.height = height * cellSize;

  for (let col = 0; col < width; col++) {
    for (let row = 0; row < height; row++) {
      const tileId = mapData["Terrain Map"][col][row];
      const tile = tileData[tileId];
      let img = tile.sprite;

      // NOTE: Update this for animations
      if (Array.isArray(img)) {
        img = img[0];
      }

      if (tile.terrain === "building") {
        
      }

      context.drawImage(
        img,
        col * cellSize + cellSize - img.naturalWidth * scaleFactor,
        row * cellSize + cellSize - img.naturalHeight * scaleFactor,
        img.naturalWidth * scaleFactor,
        img.naturalHeight * scaleFactor,
      );
    }
  }
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
