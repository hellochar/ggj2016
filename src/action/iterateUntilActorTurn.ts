import * as Entity from "model/entity";
import { handlePerformActionAction } from "./performAction";
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

export function handleIterateUntilActorTurnAction(initialState: IState, action: IIterateUntilActorTurnAction): IState {
    let state = initialState;
    while (state.turnOrder[0] !== action.actorId) {
        const actor = state.entities[state.turnOrder[0]] as Entity.Actor;
        const nextAction = Entity.decideNextAction(state, actor);
        state = handlePerformActionAction(state, {
            actorId: actor.id,
            action: nextAction,
            type: "PerformAction",
        });
        state.turnOrder = [...state.turnOrder.splice(1), state.turnOrder[0]];
    }
    return state;
}
