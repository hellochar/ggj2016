/*
Types of cells:

wall,
space,

earth,
water,
grass,
*/

export interface IWaterTile {
    type: "WATER";
}

export interface IGrassTile {
    type: "GRASS";
}

export interface IPavedFloorTile {
    type: "PAVED_FLOOR";
    decorative?: boolean;
}

export interface IWallTile {
    type: "WALL";
    color: string;
}

export interface IDownstairsTile {
    type: "DOWNSTAIRS";
}

export interface IUpstairsTile {
    type: "UPSTAIRS";
}

export type ITile = IPavedFloorTile | IWallTile | IDownstairsTile | IUpstairsTile | IWaterTile | IGrassTile;

export type TileType = "PAVED_FLOOR" | "WALL" | "DOWNSTAIRS" | "UPSTAIRS" | "WATER" | "GRASS";
export const TileType = {
    PAVED_FLOOR: "PAVED_FLOOR" as "PAVED_FLOOR",
    WALL: "WALL" as "WALL",
    DOWNSTAIRS: "DOWNSTAIRS" as "DOWNSTAIRS",
    UPSTAIRS: "UPSTAIRS" as "UPSTAIRS",
    WATER: "WATER" as "WATER",
    GRASS: "GRASS" as "GRASS",
};