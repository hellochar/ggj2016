import { rotateTurnOrder } from "./simpleUpdaters";
import * as Redux from "redux";

import * as Entity from "model/entity";
import { IState } from "state";

export interface IIterateUntilActorTurnAction {
    actorId: string;
    type: "IterateUntilActorTurn";
}

export function createIterateUntilActorTurnAction(actorId: string): IIterateUntilActorTurnAction {
    return {
        actorId,
        type: "IterateUntilActorTurn",
    };
}

export function handleIterateUntilActorTurnAction(initialState: IState, action: IIterateUntilActorTurnAction) {
    return (dispatch: Redux.Dispatch<IState>, getState: () => IState) => {
        while (getState().turnOrder[0] !== action.actorId) {
            const actor = getState().entities[getState().turnOrder[0]] as Entity.Actor;
            const nextAction = Entity.decideNextAction(getState(), actor);
            dispatch({
                actorId: actor.id,
                action: nextAction,
                type: "PerformAction",
            });
            dispatch(rotateTurnOrder());
        }
    }
}
