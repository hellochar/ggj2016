import { badTypeError } from "util";
export type Direction = "left" | "up" | "down" | "right";

export function getBaseEnergyCost(action: Action): number {
    switch (action.type) {
        // special actions that the user will never use
        case "create-fruit":
            return 0;

        // doing nothing is extremely cheap
        case "nothing":
            return 1e-5;

        // simple movement actions take "a standard" amount of energy
        case "move":
        case "go-downstairs":
        case "go-upstairs":
        case "pick-up-item":
        case "drop-item":
        // using an item (e.g. eating fruit, reading a scroll) is also a "simple" action
        case "use-item":
            return 1e-4;

        // using items on other targets (e.g. attacking an enemy, chopping down a tree, etc.)
        // is more expensive
        case "use-item-target":
            return 1e-3;
        default: return badTypeError(action);
    }
}

export interface IMoveAction {
    type: "move";
    direction: Direction;
}

export interface IGoUpstairsAction {
    type: "go-upstairs";
}

export interface IGoDownstairsAction {
    type: "go-downstairs";
}

export interface IDoNothingAction {
    type: "nothing";
}

export interface IPickUpItemAction {
    itemId: string;
    type: "pick-up-item";
}

export interface IDropItemAction {
    itemId: string;
    type: "drop-item";
}

// TODO we're basically defining methods on the item class here; but preferably we'd allow
// individual item types to have their own actions (eg axe should have a .cutTree(target) method, and should
// also be of type weapon which has a .attack(target) method)
export interface IUseItemAction {
    itemId: string;
    type: "use-item";
}

export interface IUseItemTargettedAction {
    itemId: string;
    targetId: string;
    type: "use-item-target";
}

// creates a fruit in a nearby location.
export interface ICreateFruitAction {
    type: "create-fruit";
}

export type Action =
IMoveAction |
IGoDownstairsAction |
IGoUpstairsAction |
IDoNothingAction |
IPickUpItemAction |
IDropItemAction |
IUseItemAction |
IUseItemTargettedAction |
ICreateFruitAction
;
