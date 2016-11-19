import { Entity, IUser } from "./model/entity";
import { Level } from "./model/level";

export interface IEntities {
    [entityId: string]: Entity;

    /**
     * The special player entity.
     */
    0: IUser;
}

export interface ILevels {
    [levelId: string]: Level;
}

/**
 * Entire state of the game.
 */
export interface IState {
    /**
     * All entities in the game.
     */
    entities: IEntities;
    /**
     * The order in which levels are stacked in the game.
     */
    levelOrder: string[];
    /**
     * All the levels of the game, keyed by their levelId.
     */
    levels: ILevels;
    /**
     * Queue of actor ids waiting for their turn. The actor at the front of the
     * list will act, and then be pushed to the back of the turn order.
     */
    turnOrder: string[];

    /**
     * Which screen to show.
     */
    screen: Screen;
}

export type Screen = "play" | "user-died" | "user-won";
