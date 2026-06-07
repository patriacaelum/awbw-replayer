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

export type AWBWPredeployedUnit = {
  "Unit ID": number;
  "Unit X": number;
  "Unit Y": number;
  "Unit HP": number;
  "Country Code": string;
}