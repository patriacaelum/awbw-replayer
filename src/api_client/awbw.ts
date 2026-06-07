import { fetch } from "@tauri-apps/plugin-http";
import { info, error } from "@tauri-apps/plugin-log";

import type { AWBWMapInfo } from "./types";

export class AWBWAPIClient {
  baseURL: string = "https://awbw.amarriner.com/api";

  async getMapInfo(mapId: string): Promise<AWBWMapInfo> {
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
