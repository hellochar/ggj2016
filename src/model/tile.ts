export interface IBaseTile {
    visible: boolean;
    explored: boolean;
}

export interface ISpaceTile extends IBaseTile {
    type: "SPACE";
}

export interface IWallTile extends IBaseTile {
    type: "WALL";
    color: string;
}

export interface IDownstairsTile extends IBaseTile {
    type: "DOWNSTAIRS";
}

export interface IUpstairsTile extends IBaseTile {
    type: "UPSTAIRS";
}

export interface IDecorativeSpace extends IBaseTile {
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
