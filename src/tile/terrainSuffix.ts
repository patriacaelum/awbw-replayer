import { TileData } from "./tile_data";

export function getCorrectedTileId(
  tileData: TileData,
  map: number[][],
  x: number,
  y: number,
): number {
  const tileId = map[x][y];
  const tile = tileData.get(tileId);
  if (tile.terrain === "shoal") {
    return tileData.getTileIdByName("shoal_" + shoalSuffix(map, x, y, tileData));
  }
  if (tile.terrain === "sea") {
    if (tile.name === "reef") return tileId;
    return tileData.getTileIdByName("sea_" + seaSuffix(map, x, y, tileData));
  }
  return tileId;
}

function shoalSuffix(map: number[][], x: number, y: number, tileData: TileData): string {
  const n = y - 1 < 0 ? "c" : getTerrainSuffixCharacter(tileData.get(map[x][y - 1]).terrain, false);
  const e = x + 1 >= map.length ? "c" : getTerrainSuffixCharacter(tileData.get(map[x + 1][y]).terrain, false);
  const s = y + 1 >= map[x].length ? "c" : getTerrainSuffixCharacter(tileData.get(map[x][y + 1]).terrain, false);
  const w = x - 1 < 0 ? "c" : getTerrainSuffixCharacter(tileData.get(map[x - 1][y]).terrain, false);
  return n + e + s + w;
}

function seaSuffix(map: number[][], x: number, y: number, tileData: TileData): string {
  const north = y - 1 >= 0 ? tileData.get(map[x][y - 1]).terrain : "sea";
  const east = x + 1 < map.length ? tileData.get(map[x + 1][y]).terrain : "sea";
  const south = y + 1 < map[x].length ? tileData.get(map[x][y + 1]).terrain : "sea";
  const west = x - 1 >= 0 ? tileData.get(map[x - 1][y]).terrain : "sea";
  return (
    seaNorth(y, north) +
    seaNE(map, x, y, tileData, north, east) +
    seaEast(map, x, east) +
    seaSE(map, x, y, tileData, east, south) +
    seaSouth(map, x, y, south) +
    seaSW(map, x, y, tileData, south, west) +
    seaWest(x, west) +
    seaNW(map, x, y, tileData, west, north)
  );
}

function seaNorth(y: number, north: string | undefined): string {
  return y - 1 < 0 ? "c" : getTerrainSuffixCharacter(north, true);
}

function seaNE(
  map: number[][],
  x: number,
  y: number,
  tileData: TileData,
  north: string | undefined,
  east: string | undefined,
): string {
  if (y - 1 >= 0 && getTerrainSuffixCharacter(north, true) === "l") return "l";
  if (x + 1 < map.length && getTerrainSuffixCharacter(east, true) === "l") return "l";
  if (x + 1 >= map.length || y - 1 < 0) return "c";
  return getTerrainSuffixCharacter(tileData.get(map[x + 1][y - 1]).terrain, true);
}

function seaEast(map: number[][], x: number, east: string | undefined): string {
  return x + 1 >= map.length ? "c" : getTerrainSuffixCharacter(east, true);
}

function seaSE(
  map: number[][],
  x: number,
  y: number,
  tileData: TileData,
  east: string | undefined,
  south: string | undefined,
): string {
  if (x + 1 < map.length && getTerrainSuffixCharacter(east, true) === "l") return "l";
  if (y + 1 < map[x].length && getTerrainSuffixCharacter(south, true) === "l") return "l";
  if (x + 1 >= map.length || y + 1 >= map[x].length) return "c";
  return getTerrainSuffixCharacter(tileData.get(map[x + 1][y + 1]).terrain, true);
}

function seaSouth(map: number[][], x: number, y: number, south: string | undefined): string {
  return y + 1 >= map[x].length ? "c" : getTerrainSuffixCharacter(south, true);
}

function seaSW(
  map: number[][],
  x: number,
  y: number,
  tileData: TileData,
  south: string | undefined,
  west: string | undefined,
): string {
  if (y + 1 < map[x].length && getTerrainSuffixCharacter(south, true) === "l") return "l";
  if (x - 1 >= 0 && getTerrainSuffixCharacter(west, true) === "l") return "l";
  if (x - 1 < 0 || y + 1 >= map[x].length) return "c";
  return getTerrainSuffixCharacter(tileData.get(map[x - 1][y + 1]).terrain, true);
}

function seaWest(x: number, west: string | undefined): string {
  return x - 1 < 0 ? "c" : getTerrainSuffixCharacter(west, true);
}

function seaNW(
  map: number[][],
  x: number,
  y: number,
  tileData: TileData,
  west: string | undefined,
  north: string | undefined,
): string {
  if (x - 1 >= 0 && getTerrainSuffixCharacter(west, true) === "l") return "l";
  if (y - 1 >= 0 && getTerrainSuffixCharacter(north, true) === "l") return "l";
  if (x - 1 < 0 || y - 1 < 0) return "c";
  return getTerrainSuffixCharacter(tileData.get(map[x - 1][y - 1]).terrain, true);
}

function getTerrainSuffixCharacter(terrain: string | undefined, shoalIsSea: boolean): string {
  if (terrain === "sea" || terrain === "river") return "c";
  if (terrain === "shoal" || terrain === "bridge") {
    return shoalIsSea ? "c" : "s";
  }
  return "l";
}
