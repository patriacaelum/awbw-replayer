import { error, info } from "@tauri-apps/plugin-log";

import { TileData } from "./tile_data";
import type { Tile } from "./types";

const TEXTURE_MODULES = import.meta.glob<string>(
  "/src/assets/textures/map/aw2/**/*.png",
  { import: "default" },
);

/** Loads all tiles in the `tiles.json` file. */
export async function loadTileData(): Promise<TileData> {
  info("Loading tileset...");

  const response = await fetch("/config/tiles.json");
  const tileJSON = (await response.json()) as Record<string, Tile>;
  const tileData = new TileData();

  for (const tileId in tileJSON) {
    await loadOneTile(tileId, tileJSON[tileId], tileData);
  }

  info("Successfully loaded tileset");
  return tileData;
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

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

async function loadOneTile(tileId: string, tile: Tile, tileData: TileData): Promise<void> {
  const loader = getTextureLoader(tile.name);

  if (loader == null) {
    error(`No texture found for tile ${tileId} (name: ${tile.name})`);
    return;
  }

  const url = await loader();
  tile.sprite = await loadImage(url);
  tileData.set(Number.parseInt(tileId, 10), tile);
}
