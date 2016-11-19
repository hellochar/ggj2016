import { IResetGameAction } from "./resetGame";
import { SimpleUpdaterAction } from "./simpleUpdaters";

export type IAction =
IResetGameAction
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
