import * as _ from "lodash";
import * as React from "react";
import * as Redux from "redux";
import { connect } from "react-redux";

import { decideUserAction } from "userInput";
import { findEntityLevel, updateLevel, userPerformAction } from "action";
import { HeadsUpDisplay } from "components/headsUpDisplay";
import { PureLevel } from "components/level";
import { IState } from "state";
import { Level } from "model/level";

export interface IGameProps {
    dispatch: Redux.Dispatch<IState>;
    state: IState;
}

export class PureGame extends React.Component<IGameProps, {}> {
    private handleKeyPress = (event: KeyboardEvent) => {
        if (event.code === "Space") {
            const level = findEntityLevel("0", this.props.state);
            this.props.dispatch(updateLevel(new Level(level.id, level.map.illuminated(), level.entities)));
        }
        const action = decideUserAction(this.props.state, event);
        if (action !== undefined) {
            this.props.dispatch(userPerformAction(action));
        }
    };
    private throttledHandleKeyPress = _.throttle(this.handleKeyPress, 100);

    private handleKeyUp = () => {
        this.throttledHandleKeyPress.flush();
        this.throttledHandleKeyPress.cancel();
    };

    public componentDidMount() {
        document.addEventListener("keydown", this.throttledHandleKeyPress, false);
        document.addEventListener("keyup", this.handleKeyUp, false);
    }

    public componentWillUnmount() {
        document.removeEventListener("keydown", this.throttledHandleKeyPress, false);
        document.removeEventListener("keyup", this.handleKeyUp, false);
    }

    public render() {
        const userLevel = findEntityLevel("0", this.props.state);
        const user = this.props.state.entities["0"];

        return (
            <div className="rg-game">
                <div className="rg-viewport">
                    <PureLevel
                        center={user.position}
                        levelEntities={userLevel.entities.map((entityId) => this.props.state.entities[entityId])}
                        level={userLevel} />
                </div>
                <HeadsUpDisplay />
            </div>
        );
    }
}

export const Game = connect(
    (state: IState) => { return { state }; },
    (dispatch: Redux.Dispatch<IState>) => { return { dispatch }; }
)(PureGame);
