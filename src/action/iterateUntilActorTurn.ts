import { rotateTurnOrder, actorPerformAction } from "action";
import * as Redux from "redux";

import * as Entity from "model/entity";
import { IState } from "state";

export function iterateUntilActorTurn(actorId: string) {
    return (dispatch: Redux.Dispatch<IState>, getState: () => IState) => {
        while (getState().turnOrder[0] !== actorId) {
            const actor = getState().entities[getState().turnOrder[0]] as Entity.Actor;
            const nextAction = Entity.decideNextAction(getState(), actor);
            dispatch(actorPerformAction(actor.id, nextAction));
            dispatch(rotateTurnOrder());
        }
    }
}
