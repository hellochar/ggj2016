import * as _ from "lodash";

import { IState, Screen } from "state";

export interface ISetScreenAction {
    screen: Screen;
    type: "SetScreen";
}

export function createSetScreenAction(screen: Screen): ISetScreenAction {
    return {
        screen,
        type: "SetScreen",
    };
}

export function handleSetScreen(state: IState, action: ISetScreenAction): IState {
    const newState = _.assign({}, state);
    newState.screen = action.screen;
    return newState;
}
