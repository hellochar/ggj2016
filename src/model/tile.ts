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

export interface IDecorativeSpace {
    type: "DECORATIVE_SPACE";
}

export type ITile = IPavedFloorTile | IWallTile | IDownstairsTile | IUpstairsTile | IDecorativeSpace | IWaterTile | IGrassTile;

export type TileType = "PAVED_FLOOR" | "WALL" | "DOWNSTAIRS" | "UPSTAIRS" | "DECORATIVE_SPACE" | "WATER" | "GRASS";
export const TileType = {
    PAVED_FLOOR: "PAVED_FLOOR" as "PAVED_FLOOR",
    WALL: "WALL" as "WALL",
    DOWNSTAIRS: "DOWNSTAIRS" as "DOWNSTAIRS",
    UPSTAIRS: "UPSTAIRS" as "UPSTAIRS",
    DECORATIVE_SPACE: "DECORATIVE_SPACE" as "DECORATIVE_SPACE",
    WATER: "WATER" as "WATER",
    GRASS: "GRASS" as "GRASS",
};