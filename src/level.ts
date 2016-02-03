/// <reference path="../typings/tsd.d.ts" />
/* tslint:disable */

import { IEntity } from "./entity";

export enum TileType {
    SPACE = 0,
    WALL = 1,
    DOWNSTAIRS = 2
}

export interface Tile {
    visible: boolean;
    type: TileType;
}

export interface ILevel {
    map: Tile[][];
    entities: IEntity[];
}
