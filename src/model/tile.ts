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

export interface ISpaceTile {
    type: "SPACE";
}

export interface IGrassTile {

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

export type ITile = ISpaceTile | IWallTile | IDownstairsTile | IUpstairsTile | IDecorativeSpace | IWaterTile | IGrassTile;

export type TileType = "SPACE" | "WALL" | "DOWNSTAIRS" | "UPSTAIRS" | "DECORATIVE_SPACE" | "WATER" | "GRASS";
export const TileType = {
    SPACE: "SPACE" as "SPACE",
    WALL: "WALL" as "WALL",
    DOWNSTAIRS: "DOWNSTAIRS" as "DOWNSTAIRS",
    UPSTAIRS: "UPSTAIRS" as "UPSTAIRS",
    DECORATIVE_SPACE: "DECORATIVE_SPACE" as "DECORATIVE_SPACE",
    WATER: "WATER" as "WATER",
    GRASS: "GRASS" as "GRASS",
};