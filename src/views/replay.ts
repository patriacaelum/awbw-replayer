import Alpine from "alpinejs";
import { info } from "@tauri-apps/plugin-log";

import cursorFile from "/src/assets/textures/ui/select.png";
import { openFile, pathExists, saveFile } from "../fileIO";
import { AWBWAPIClient, AWBWMapInfo } from "../api_client/awbw";
import { ReplayParser } from "../replay/parser";
import { drawMap, canvasToGrid, drawTileAtGrid, BASE_SIZE, Tile } from "../replay/map";

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", setup);
} else {
  setup();
}

function setup() {
  const params = new URLSearchParams(window.location.search);
  const replayId = params.get("id");

  if (replayId === null) {
    location.assign("/index.html");
    return;
  }

  info(`Loading replay ${replayId}`);
  Alpine.store("replayId", replayId);
  Alpine.store("scaleFactor", 2);
  Alpine.start();

  loadReplayFile(replayId);
}

let currentMapData: AWBWMapInfo | null = null;
let mapWidth = 0;
let mapHeight = 0;
let overlayCtx: CanvasRenderingContext2D | null = null;
let overlay: HTMLCanvasElement | null = null;
let cursorTile: Tile | null = null;

async function loadReplayFile(replayId: string) {
  const turnData = await openFile("replays/" + replayId);
  const actionData= await openFile("replays/" + "a" + replayId);

  const turnDataParser = new ReplayParser(turnData);
  const turns = turnDataParser.parseTurnData();
  // const actionDataParser = new ReplayParser(actionData);
  // const actions = actionDataParser.parseActionData();

  const mapId = turns[0].maps_id;
  Alpine.store("mapId", mapId);
  info(`Loading map ${mapId}`);
  loadMapFile(mapId);
}

async function loadMapFile(mapId: number) {
  const mapFilename = "maps/" + mapId + ".json";
  let mapData: AWBWMapInfo;

  if (await pathExists(mapFilename)) {
    mapData = JSON.parse(await openFile(mapFilename)) as AWBWMapInfo;
  } else {
    const client = new AWBWAPIClient()
    mapData = await client.getMapInfo(mapId);

    if (mapData.err === undefined) {
      await saveFile(mapFilename, JSON.stringify(mapData));
    } else {
      Alpine.store("mapLoadingError", mapData.message);
    }
  }

  const sizeX = mapData["Size X"];
  const sizeY = mapData["Size Y"];
  const tiles = mapData["Terrain Map"];
  const distinctTiles = [...new Set(tiles.flat())].sort();
  info(`Distinct tile values (${distinctTiles.length}): ${distinctTiles.join(", ")}`);

  info(`Successfully loaded map ${mapId}`);
  Alpine.store("mapName", mapData.Name);
  Alpine.store("mapAuthor", mapData.Author);
  Alpine.store("mapSize", { x: sizeX, y: sizeY });

  currentMapData = mapData;
  const canvas = document.getElementById("map-grid") as HTMLCanvasElement;
  const overlayEl = document.getElementById("map-overlay") as HTMLCanvasElement;
  overlay = overlayEl;

  const scaleFactor = Alpine.store("scaleFactor") as number;
  const { tileData, mapWidth: w, mapHeight: h } = await drawMap(canvas, mapData, scaleFactor);
  mapWidth = w;
  mapHeight = h;
  Alpine.store("cellSize", BASE_SIZE * scaleFactor);

  overlayEl.width = canvas.width;
  overlayEl.height = canvas.height;

  const plainTile = tileData[1];
  if (!plainTile) {
    return;
  }

  const ctxOrNull = overlayEl.getContext("2d");
  if (!ctxOrNull) {
    return;
  }

  overlayCtx = ctxOrNull;
  const cursorImage = new Image();
  cursorImage.src = cursorFile;
  cursorTile = {
    name: "cursor",
    sprite: cursorImage,
  };

  canvas.addEventListener("mousemove", (e) => {
    if (!overlayCtx || !overlay || !cursorTile) return;
    const scale = Alpine.store("scaleFactor") as number;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const offsetX = (e.clientX - rect.left) * scaleX;
    const offsetY = (e.clientY - rect.top) * scaleY;

    const cell = canvasToGrid(offsetX, offsetY, mapWidth, mapHeight, scale);
    if (cell) {
      overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
      drawTileAtGrid(overlayCtx, cursorTile, cell.gx, cell.gy, scale);
    } else {
      overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
    }
  });

  canvas.addEventListener("mouseleave", () => {
    if (overlayCtx && overlay) overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
  });

  (window as Window & { __redrawMap?: () => Promise<void> }).__redrawMap = redrawMap;
}

async function redrawMap() {
  if (!currentMapData || !overlay || !overlayCtx || !cursorTile) return;
  const canvas = document.getElementById("map-grid") as HTMLCanvasElement;
  const scaleFactor = Alpine.store("scaleFactor") as number;

  await drawMap(canvas, currentMapData, scaleFactor);
  Alpine.store("cellSize", BASE_SIZE * scaleFactor);

  overlay.width = canvas.width;
  overlay.height = canvas.height;
  overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
}
