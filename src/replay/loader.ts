import {
  BaseDirectory,
  exists,
  mkdir,
  readFile,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { error, info } from "@tauri-apps/plugin-log";

import { AWBWAPIClient } from "../api_client/awbw";
import { unzipReplayFile } from "../fileIO";
import { ReplayParser } from "./parser";

export async function loadReplayFile(filepath: string) {
  const filedata = await readFile(filepath);
  const replayData = await unzipReplayFile(filedata);

  const parser = new ReplayParser(replayData.turnData);
  const turnData = parser.parseTurnData();
  info(`Successfully parsed turn data with ${turnData.length} turns`);

  const turn = turnData[0];
  const mapId = turn.maps_id;
  const mapFilename = `maps/${mapId}.json`;
  const mapFileOptions = { baseDir: BaseDirectory.AppData };

  try {
    await mkdir("maps", { ...mapFileOptions, recursive: true });
    info("Created maps directory");
  } catch (err) {
    error(JSON.stringify(err));
    throw new Error("Unable to create maps directory");
  }

  let mapFileExists = false;
  try {
    mapFileExists = await exists(mapFilename, mapFileOptions);
  } catch (err) {
    error(JSON.stringify(err));
    throw new Error("Unable to check if file exists");
  }
  let map;

  if (mapFileExists) {
    info(`Found map ${mapId} locally, loading...`);
    map = await readTextFile(mapFilename, mapFileOptions);
  } else {
    info(`Failed to find ${mapFilename} locally`);

    const client = new AWBWAPIClient();
    map = await client.getMapInfo(mapId);

    try {
      info(`Saving map ${mapId} to ${mapFilename}...`)
      await writeTextFile(mapFilename, JSON.stringify(map), mapFileOptions);
      info(`Successfully saved map ${mapId} to ${mapFilename}`);
    } catch (err) {
      error(JSON.stringify(err));
      throw new Error("Failed to write map to file");
    }
  }

  // TODO: parse action data
  // const actionParser = new ReplayParser(replayData.actionData);
  // const actionData = actionParser.parseValue() as ReplayActionData;
  // info(`Successfully loaded action data`);
}
