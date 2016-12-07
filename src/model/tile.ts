export interface ISpaceTile {
    type: "SPACE";
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

export type ITile = ISpaceTile | IWallTile | IDownstairsTile | IUpstairsTile | IDecorativeSpace;

export type TileType = "SPACE" | "WALL" | "DOWNSTAIRS" | "UPSTAIRS" | "DECORATIVE_SPACE";
export const TileType = {
    SPACE: "SPACE" as "SPACE",
    WALL: "WALL" as "WALL",
    DOWNSTAIRS: "DOWNSTAIRS" as "DOWNSTAIRS",
    UPSTAIRS: "UPSTAIRS" as "UPSTAIRS",
    DECORATIVE_SPACE: "DECORATIVE_SPACE" as "DECORATIVE_SPACE",
};