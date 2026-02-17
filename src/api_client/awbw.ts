import { fetch } from "@tauri-apps/plugin-http";
import { info, error } from "@tauri-apps/plugin-log";

type AWBWMapInfo = {
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
    const response = await fetch(
      `${this.baseURL}/map/map_info.php?map_id=${mapId}`,
      { method: "GET" },
    );

    if (response.status === 200) {
      info(`Successfully got map ${mapId}: ${response.status}`);
    } else {
      error(`Failed to get map ${mapId}: ${response.status} - ${response.body}`);
    }

    const data = await response.json() as AWBWMapInfo;

    return data;
  }
}
