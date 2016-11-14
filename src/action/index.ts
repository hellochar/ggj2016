import { IChangeLevelAction } from "./changeLevel";
import { IIterateUntilActorTurnAction } from "./iterateUntilActorTurn";
import { IPerformActionAction } from "./performAction";
import { IResetGameAction } from "./resetGame";
import { ISetScreenAction } from "./setScreen";

export type IAction =
IPerformActionAction
| IChangeLevelAction
| IIterateUntilActorTurnAction
| IResetGameAction
| IReduxInitAction
| ISetScreenAction
;

export interface IReduxInitAction {
    type: "@@redux/INIT";
}

export * from "./changeLevel";
export * from "./iterateUntilActorTurn";
export * from "./performAction";
export * from "./resetGame";
export * from "./setScreen";
export * from "./utils";
