import { buildInitialState } from "initialState";
import { IState } from "state";

export interface IResetGameAction {
    type: "ResetGame";
}

export function createResetGameAction(): IResetGameAction {
    return { type: "ResetGame" };
}

export function handleResetGameAction(state: IState, action: IResetGameAction): IState {
    return buildInitialState();
}
