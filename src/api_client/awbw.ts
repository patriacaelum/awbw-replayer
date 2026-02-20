import { fetch } from "@tauri-apps/plugin-http";
import { info, error } from "@tauri-apps/plugin-log";

export type AWBWMapInfo = {
  err: string | undefined;
  message: string | undefined;
  Name: string;
  Author: string;
  "Player Count": number;
  "Published Date": string;
  "Size X": number;
  "Size Y": number;
  "Terrain Map": number[][];
  "Predeployed Units": AWBWPredeployedUnit[];
}

type AWBWPredeployedUnit = {
  "Unit ID": number;
  "Unit X": number;
  "Unit Y": number;
  "Unit HP": number;
  "Country Code": string;
}

export class AWBWAPIClient {
  baseURL: string = "https://awbw.amarriner.com/api";

  async getMapInfo(mapId: number): Promise<AWBWMapInfo> {
    info(`Retrieving map ${mapId} from awbw...`);
    const response = await fetch(
      `${this.baseURL}/map/map_info.php?maps_id=${encodeURIComponent(mapId)}`,
      { method: "GET" },
    );

    if (response.status === 200) {
      info(`Successfully got map ${mapId}: ${response.status}`);
    } else {
      error(`Failed to get map ${mapId}: ${response.status} - ${response.body}`);
    }

    const data = await response.json() as AWBWMapInfo;

    if (data.err !== undefined) {
      error(`Failed to get map ${mapId}: ${data.err} - ${JSON.stringify(data)}`);
    }

    return data;
  }
}
