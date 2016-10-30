/* tslint:disable */

import { Entity } from "./model/entity";
import { Level } from "./model/level";

export interface IState {
    /**
     * All entities in the game.
     */
    entities: {
        [entityId: string]: Entity;
    };
    /** Array of levelIds. */
    levelOrder: string[];
    levels: {
        [levelId: string]: Level;
    };
}
