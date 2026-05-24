export type Tile = {
  name: string;
  defence?: number;
  sprite: HTMLImageElement | HTMLImageElement[];
  movementCost?: {
    lightInfantry?: number;
    heavyInfantry?: number;
    tread?: number;
    tire?: number;
    air?: number;
  };
  terrain?: string;
};
