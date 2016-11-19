export type Direction = "left" | "up" | "down" | "right";

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
