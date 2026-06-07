import Alpine from "alpinejs";
import { info } from "@tauri-apps/plugin-log";
import { loadReplay, loadMap } from "../replay/loader";
import { drawMap } from "../map/draw";
import { mouseEventToGrid } from "../map/grid";
import { drawTileAtGrid } from "../map/draw";


if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", setupReplayPage);
} else {
  setupReplayPage();
}

async function setupReplayPage(): Promise<void> {
  const canvas = document.getElementById("map-grid") as HTMLCanvasElement;
  const overlay = document.getElementById("map-overlay") as HTMLCanvasElement;

  loadReplayPage(canvas);

  canvas.addEventListener("mousemove", (event: MouseEvent): void => {
    onCanvasMouseMove(event, overlay);
  });
  canvas.addEventListener("mouseleave", (_: MouseEvent): void => {
    clearCanvas(overlay);
  });
}

async function loadReplayPage(canvas: HTMLCanvasElement): Promise<void> {
  const replayId = new URLSearchParams(window.location.search).get("id");

  if (replayId === null) {
    location.assign("/index.html");
    return;
  }

  info(`Loading replay ${replayId}...`);

  const replayData = await loadReplay(replayId);
  const mapId = replayData.replay[0].maps_id.toString();
  const mapData = await loadMap(mapId);
  const scaleFactor = 2;

  Alpine.store("mapName", mapData.Name);
  Alpine.store("mapAuthor", mapData.Author);
  Alpine.store("mapSize", { x: mapData["Size X"], y: mapData["Size Y"] });
  Alpine.store("scaleFactor", scaleFactor);
  Alpine.start();

  drawMap(canvas, mapData, scaleFactor);
}

async function onCanvasMouseMove(
  e: MouseEvent,
  canvas: HTMLCanvasElement,
): Promise<void> {
  const mapSize = Alpine.store("mapSize") as { x: number, y: number };
  const scaleFactor = Alpine.store("scaleFactor") as number;
  const context = clearCanvas(canvas);
  const gridPosition = mouseEventToGrid(canvas, e, mapSize, scaleFactor);

  if (gridPosition !== null) {
    drawTileAtGrid(context, cursorTile, gridPosition, scaleFactor);
  }
}

/** Clears the canvas and returns the 2d rendering context. */
function clearCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d");
  
  if (!context) {
    throw new Error(
      "Failed to remove mouse cursor: no 2d context found in overlay canvas"
    );
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  return context;
}
