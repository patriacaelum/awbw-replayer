import { readFile } from "@tauri-apps/plugin-fs";
import { info } from "@tauri-apps/plugin-log";

import { AWBWAPIClient } from "../api_client/awbw";
import { createDirectory, pathExists, saveFile, unzipReplayFile } from "../fileIO";
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

  await createDirectory("maps");
  const mapFileExists = await pathExists(mapFilename);

  if (!mapFileExists) {
    const client = new AWBWAPIClient();
    const mapInfo = await client.getMapInfo(mapId);
    await saveFile(mapFilename, JSON.stringify(mapInfo));
  }

  // TODO: parse action data
  // const actionParser = new ReplayParser(replayData.actionData);
  // const actionData = actionParser.parseValue() as ReplayActionData;
  // info(`Successfully loaded action data`);
}
