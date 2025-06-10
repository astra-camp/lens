export interface HotSpot {
  coord: [number, number, number];
  linkTo: string;
}

export interface Scene {
  id: string;
  imageUrl: string;
  hotSpots: HotSpot[];
}
