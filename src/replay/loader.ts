import { error, info } from "@tauri-apps/plugin-log";

import { AWBWAPIClient, AWBWMapInfo } from "../api_client/awbw";
import { createDirectory, openFile, pathExists, saveFile } from "../fileIO";
import { ReplayParser } from "./parser";
import { AWBWGame } from "./types";

type ReplayActionData = {
  replay: AWBWGame[];
  action: any;
}

/** When loading the replay file, we assume that the replay and action files
 *  were created when the zip file was selected on the `/main` page.
 */
export async function loadReplay(replayId: string): Promise<ReplayActionData> {
  // Open replay and action data from $APPDATA
  const replayFilepath = "replays/" + replayId;
  const actionFilepath = "replays/a" + replayId;

  const replayFileExists = await pathExists(replayFilepath);
  const actionFileExists = await pathExists(actionFilepath);

  if (!replayFileExists || !actionFileExists) {
    error(`Could not find replay or action file for replay ${replayId}`);
    window.location.assign("/");
    throw new Error(`Could not find replay or action file for replay ${replayId}`);
  }

  const replayFileData = await openFile(replayFilepath);
  const actionFileData = await openFile(actionFilepath);

  // Parse replay and action data
  const replayData = new ReplayParser(replayFileData).parseTurnData();
  const actionData = new ReplayParser(actionFileData).parseActionData();
  info(`Successfully loaded replay data`);

  return {replay: replayData, action: actionData};
}

/** When loading the map file, if the map does not exist, try to retrieve the
 *  map from AWBW API and write to $APPDATA for later.
 */
export async function loadMap(mapId: string): Promise<AWBWMapInfo> {
  const mapsDirectory = "maps/";
  const mapsDirectoryExists = await pathExists(mapsDirectory);

  if (!mapsDirectoryExists) {
    await createDirectory(mapsDirectory);
  }

  const mapFilename = mapsDirectory + mapId + ".json";
  const mapFileExists = await pathExists(mapFilename);
  let mapInfo;

  if (!mapFileExists) {
    const client = new AWBWAPIClient();
    mapInfo = await client.getMapInfo(mapId);

    if (mapInfo.err !== undefined) {
      error(`Failed to load map: ${mapInfo.message}`);
      throw new Error(mapInfo.message);
    }

    await saveFile(mapFilename, JSON.stringify(mapInfo));
  } else {
    let fileData = await openFile(mapFilename);
    mapInfo = JSON.parse(fileData);
  }

  return mapInfo;
}
