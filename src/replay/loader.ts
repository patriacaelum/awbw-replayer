import { readFile } from "@tauri-apps/plugin-fs";
import { info } from "@tauri-apps/plugin-log";

import { unzipReplayFile } from "../fileIO";
import { ReplayParser } from "./parser";
import { ReplayTurnData } from "./types";

export async function loadReplayFile(filepath: string) {
  const filedata = await readFile(filepath);
  const replayData = await unzipReplayFile(filedata);

  info(replayData.turnData);
  const parser = new ReplayParser(replayData.turnData);
  const turnData = parser.parseValue() as ReplayTurnData;
  const mapId = turnData["maps_id"];
  info(`Successfully loaded turn data with map ${mapId}`);

  // TODO: parse action data
  // const actionParser = new ReplayParser(replayData.actionData);
  // const actionData = actionParser.parseValue() as ReplayActionData;
  // info(`Successfully loaded action data`);
}
