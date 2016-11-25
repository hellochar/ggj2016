import { IResetGameAction } from "./resetGame";
import { SimpleUpdaterAction } from "./simpleUpdaters";

export type IAction =
IResetGameAction
| IReduxInitAction
| IReduxDevtoolsExtensionInitAction
| SimpleUpdaterAction
;

export interface IReduxInitAction {
    type: "@@redux/INIT";
}

// With redux devtools Chrome extension enabled, the reducer will recieve this type of init action instead of
// the IReduxInitAction
export interface IReduxDevtoolsExtensionInitAction {
    type: "@@INIT";
}

export * from "./changeLevel";
export * from "./entityDealDamage";
export * from "./iterateUntilActorTurn";
export * from "./performAction";
export * from "./resetGame";
export * from "./utils";
export * from "./simpleUpdaters";
