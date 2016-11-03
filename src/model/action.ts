
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

export interface IUseItemAction {
    itemId: string;
    type: "use-item";
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
ICreateFruitAction
;
