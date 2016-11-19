import { IChangeLevelAction } from "./changeLevel";
import { IIterateUntilActorTurnAction } from "./iterateUntilActorTurn";
import { IPerformActionAction, IUserPerformActionAction } from "./performAction";
import { IResetGameAction } from "./resetGame";
import { SimpleUpdaterAction } from "./simpleUpdaters";

export type IAction =
IPerformActionAction
| IUserPerformActionAction
| IChangeLevelAction
| IIterateUntilActorTurnAction
| IResetGameAction
| IReduxInitAction
| SimpleUpdaterAction
;

export interface IReduxInitAction {
    type: "@@redux/INIT";
}

export * from "./changeLevel";
export * from "./iterateUntilActorTurn";
export * from "./performAction";
export * from "./resetGame";
export * from "./utils";
export * from "./simpleUpdaters";
