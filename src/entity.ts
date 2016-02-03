/* tslint:disable */

import { Position } from "./math";

export enum EntityType {
    USER,
    MERCURY
}

export interface IEntity extends Position {
    health: number;
    maxHealth: number;
    type: EntityType;
    name?: string;
}
