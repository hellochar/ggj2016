import { IBaseEntity } from "./entity";
import * as _ from "lodash";

/*
to implement:
fa-pied-piper-alt as a dart blower
fa-odnoklassniki as a POWERMAN;  see also fa-odnoklassniki-square for an alternate version

Other ideas:

fa-rebel for some crazy item/insignia
fa-tencent-weibo as a flower icon
fa-xing and fa-modx as origami
fa-ge as some crazy power core
fa-pagelines as a leaf of peace

misc cool ones:

fa-500px, fa-deviantart, fa-forumbee, fa-gg, fa-opencart

*/

import { IPosition } from "../math";
import { IState } from "../state";
import * as Actions from "./action";

/**
 * Utility methods.
 */
export function getEntitiesAtPosition(state: IState, levelId: string, position: IPosition): string[] {
    const allEntitiesOnLevel = state.levels[levelId].entities;
    return allEntitiesOnLevel.filter((entityId) => {
        return _.isEqual(state.entities[entityId].position, position);
    });
}

export function move<T extends IHasPosition>(e: T, offset: IPosition) {
    return _.assign({}, e, {
        position: {
            x: e.position.x + offset.x,
            y: e.position.y + offset.y
        }
    });
}

export function decideNextAction(state: IState, actor: Actor): Actions.Action {
    switch (actor.type) {
        case "user": throw new Error("decideNextAction called on user!");
        case "mercury":
            const possibleActions: Actions.Action[] = [
                {
                    type: "nothing"
                }, {
                    direction: "up",
                    type: "move"
                }, {
                    direction: "down",
                    type: "move"
                }, {
                    direction: "left",
                    type: "move"
                }, {
                    direction: "right",
                    type: "move"
                }
            ];
            return _.sample(possibleActions) as Actions.Action;
        case "tree":
            if (Math.random() < 0.02) {
                return {
                    type: "create-fruit",
                };
            } else {
                return {
                    type: "nothing",
                };
            }
    }
}

/* TODO
 * 1. Make entities only move by returning Redux Actions.

 * Worry: we're mixing game actions (such as open/close the UI) with game-model actions (such as entity moves).
 * solution: Each entity has its own Redux Store which accepts game-model actions.
 *
 * Separately, we have the global game store which, as part of its state, holds all of the individual entities' states.
 */

// An Entity is really just a bag of properties. To clone one, you just
// need to copy all its properties to a new object. The contract for Entities
// is that their constructors can have no side effects. All methods do is either
// mutate the Entity's exposed members.

/**
 * Properties common to entities - anything that exists in the game.
 */
export interface IBaseEntity {
    /**
     * Unique id of this entity.
     */
    id: string;
}

export interface IHasHealth {
    /**
     * Health of this entity.
     */
    health: number;

    /**
     * Max health of this entity.
     */
    maxHealth: number;
}

export function hasHealth(e: Entity): e is (Entity & IHasHealth) {
    return e.type === "user" || e.type === "mercury";
}

export interface IHasPosition {
    /**
     * Entity's current position in the 2D universe.
     */
    position: IPosition;
}

export interface IHasInventory {
     inventory: IInventory;
}

export function hasInventory(e: Entity): e is (Entity & IHasInventory) {
    return e.type === "user" || e.type === "mercury";
}

export interface IInventory {
    /**
     * Array of items in this inventory.
     */
    itemIds: string[];

    /**
     * Max number of items that can be held.
     */
    maxSize?: number;
}

export type Entity = Item | Actor | IHouse;
export type EntityType = ItemType | ActorType | "house";

export type Item = IRing | IFruit | IAxe;
export type ItemType = "ring" | "fruit" | "axe";

export function isItem(e: Entity) {
    return e.type === "fruit" || e.type === "ring" || e.type === "axe";
}

export interface IBaseActor extends IBaseEntity, IHasPosition { }

/**
 * An actor is an Entity that is placed in the turn order and can take actions when it is
 * that actor's turn.
 */
export type Actor = IUser | IMercury | ITree;
export type ActorType = "user" | "mercury" | "tree";

export function isActor(e: Entity) {
    return e.type === "user" || e.type === "mercury" || e.type === "tree";
}

export interface IUser extends IBaseActor, IHasHealth, IHasInventory {
    type: "user";

    /**
     * Non-unique name of this entity, to be shown to users.
     */
    name: string;

    /**
     * Number from 0 to 1 describing how full of food this entity is. 1 means
     * completely full, 0 means starving.
     */
    satiation: number;

    /**
     * Degrees Celcius describing how warm the user's skin/extremities are. Some datapoints:
     * 
     * 10 -> 25 degrees C - "normal" warmth.
     * 0 -> 10 degrees C - "cold". At this level, doing things gets a bit harder.
     * -10 -> 0 degrees C - "freezing". You are cold.
     * -20 -> -10 - "superfreezing". If you don't wear really warm clothes, you are going to freeze quickly.
     */
    temperature: number;
}

export interface IMercury extends IBaseActor, IHasHealth, IHasInventory {
    type: "mercury";
}

export interface IRing extends IBaseEntity, IHasPosition {
    type: "ring";
}

export interface IFruit extends IBaseEntity, IHasPosition {
    type: "fruit";
}

export interface IAxe extends IBaseEntity, IHasPosition {
    type: "axe";
}

export interface ITree extends IBaseActor {
    type: "tree";
}

// export interface ILeaf extends IBaseEntity, IHasHealth, IHasPosition {
//     type: "leaf";
// }

export interface IHouse extends IBaseEntity, IHasPosition {
    type: "house";
}
