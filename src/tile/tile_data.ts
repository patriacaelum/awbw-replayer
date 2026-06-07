import { error, info } from "@tauri-apps/plugin-log";

import type { Tile } from "./types";
import type { Vector2 } from "../types";
import { shoalSuffix, seaSuffix } from "./terrainSuffix";

const TEXTURES = import.meta.glob<string>(
  "/src/assets/textures/map/aw2/**/*.png",
  { import: "default" },
);

export class TileData {
  [key: number]: Tile;
  private tiles: Map<number, Tile> = new Map();
  private names: Map<string, number> = new Map();

  public get(tileId: number): Tile;
  public get(tileName: string): Tile;
  public get(tileIdOrName: number | string): Tile {
    if (typeof tileIdOrName === "number") {
      return this.getTileById(tileIdOrName);
    }
    
    if (typeof tileIdOrName === "string") {
      return this.getTileByName(tileIdOrName);
    }
    
    error(`No implementation for type ${typeof tileIdOrName}`);
    throw new Error(`No implementation for type ${typeof tileIdOrName}`);
  }

  public getVariation(map: number[][], tilePosition: Vector2): Tile {
    const tileId = map[tilePosition.x][tilePosition.y];
    const tile = this.getTileById(tileId);

    if (tile.terrain === "shoal") {
      return this.getTileByName("shoal_" + shoalSuffix(map, tilePosition, this));
    }

    if (tile.terrain === "sea") {
      return this.getTileByName("sea_" + seaSuffix(map, tilePosition, this));
    }

    return tile;
  }

  public async loadTiles(): Promise<void> {
    info("Loading tileset...");
    const response = await fetch("/config/tiles.json");
    const tileJSON = (await response.json()) as Record<string, Tile>;

    for (const tileId in tileJSON) {
      const tile = tileJSON[tileId];
      const tileFile = await this.getTileFile(tile);

      if (tileFile == null) {
        error(`No texture found for tile with { id: ${tileId}, name: ${tile.name} }`);
        continue;
      }

      tile.sprite = await this.loadImage(tileFile);
      this.set(Number.parseInt(tileId, 10), tile);
    }
  }

  private getTileById(tileId: number): Tile {
    const tile = this.tiles.get(tileId);
    if (tile === undefined) {
      error(`Tile with id ${tileId} does not exist`);
      throw new Error(`Tile with id ${tileId} does not exist`);
    }
    return tile;
  }

  private getTileByName(name: string): Tile {
    const tileId = this.names.get(name);
    if (tileId === undefined) {
      error(`Tile with name ${name} does not exist`);
      throw new Error(`Tile with name ${name} does not exist`);
    }
    return this.getTileById(tileId);
  }

  private async getTileFile(tile: Tile): Promise<string | null> {
    const staticName = `/src/assets/textures/map/aw2/${tile.name}.png`;
    const animatedName = `/src/assets/textures/map/aw2/${tile.name}_0.png`;

    let url: string | null = null;

    if (TEXTURES[staticName]) {
      url = await TEXTURES[staticName]();
    } else if (TEXTURES[animatedName]) {
      url = await TEXTURES[animatedName]();
    }

    return url;
  }

  private async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }
  
  private set(tileId: number, tile: Tile): void {
    this.tiles.set(tileId, tile);
    this.names.set(tile.name, tileId);
  }
}
