import { Entity, IUser } from "./model/entity";
import { Level } from "./model/level";

export interface IEntities {
    readonly [entityId: string]: Entity;

    /**
     * The special player entity.
     */
    readonly 0: IUser;
}

export interface ILevels {
    readonly [levelId: string]: Level;
}

/**
 * Entire state of the game.
 */
export interface IState {
    /**
     * All entities in the game.
     */
    readonly entities: IEntities;
    /**
     * The order in which levels are stacked in the game.
     */
    readonly levelOrder: string[];
    /**
     * All the levels of the game, keyed by their levelId.
     */
    readonly levels: ILevels;
    /**
     * Queue of actor ids waiting for their turn. The actor at the front of the
     * list will act, and then be pushed to the back of the turn order.
     */
    readonly turnOrder: string[];

    /**
     * Which screen to show.
     */
    readonly screen: Screen;

    /**
     * Global flags that control when to show certain UI elements (such as when you first enter a new level).
     */
    readonly globalTriggers: IGlobalTriggers;
}

export interface IGlobalTriggers {
    seenIntro: boolean;
}

export type Screen = "play" | "user-died" | "user-won";
