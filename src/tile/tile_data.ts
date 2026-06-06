import { error } from "@tauri-apps/plugin-log";

import type { Tile } from "./types";

export class TileData {
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
