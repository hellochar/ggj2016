import {
    IAction,
    handleResetGameAction,
    isSimpleUpdaterAction,
} from "action";
import { IState } from "state";
import { badTypeError } from "util";
import simpleReducer from "reducer/simpleUpdaters";

/**
 * Top-level reducer for the game.
 */
export default function reducer(state: IState, action: IAction): IState {
    if (action.type === "ResetGame") {
        return handleResetGameAction(state, action);
    } else if (isSimpleUpdaterAction(action)) {
        return simpleReducer(state, action);
    } else if (action.type === "@@redux/INIT") {
        return state;
    } else {
        return badTypeError(action);
    }
}
