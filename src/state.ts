import { Entity } from "./model/entity";
import { Level } from "./model/level";
import { Actor } from "./model/entity";

/**
 * Entire state of the game.
 */
export interface IState {
    /**
     * All entities in the game.
     */
    entities: {
        [entityId: string]: Entity;
    };
    /**
     * The order in which levels are stacked in the game.
     */
    levelOrder: string[];
    /**
     * All the levels of the game, keyed by their levelId.
     */
    levels: {
        [levelId: string]: Level;
    };
    /**
     * Queue of actor ids waiting for their turn. The actor at the front of the
     * list will act, and then be pushed to the back of the turn order.
     */
    turnOrder: string[];
}
