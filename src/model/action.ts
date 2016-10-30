
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

export type Action = IMoveAction | IGoDownstairsAction | IGoUpstairsAction | IDoNothingAction;
