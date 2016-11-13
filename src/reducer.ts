import { IAction, handlePerformActionAction, handleChangeLevelAction, handleIterateUntilActorTurnAction, handleUserDied, handleResetGameAction } from "action";
import { IState } from "state";

function badTypeError(t: never): never {
    throw new Error(`Didn't understand ${JSON.stringify(t)}`);
}

/**
 * Top-level reducer for the game.
 */
export default function reducer(state: IState, action: IAction): IState {
    if (action.type === "PerformAction") {
        const nextState = handlePerformActionAction(state, action);
        // TODO don't make this happen here
        // nextState !== state is to ensure the action was valid and to move time forward
        if (nextState !== state && action.actorId === "0") {
            // move user to the end of the turn order
            nextState.turnOrder = [...nextState.turnOrder.splice(1), nextState.turnOrder[0]];
            // make user a bit hungrier
            const user = nextState.entities[0];
            user.satiation = Math.max(0, user.satiation - 0.001);
            if (user.satiation <= 0) {
                // user is starving - start dealing damage
                user.health -= 1;
            }
            // kill user if dead
            if (user.health <= 0) {
                return handleUserDied(nextState);
            }
            return handleIterateUntilActorTurnAction(nextState, {
                actorId: "0",
                type: "IterateUntilActorTurn",
            });
        } else {
            return nextState;
        }
    } else if (action.type === "ChangeLevel") {
        return handleChangeLevelAction(state, action);
    } else if (action.type === "IterateUntilActorTurn") {
        return handleIterateUntilActorTurnAction(state, action);
    } else if (action.type === "ResetGame") {
        return handleResetGameAction(state, action);
    } else if (action.type === "@@redux/INIT") {
        return state;
    } else {
        return badTypeError(action);
    }
}
