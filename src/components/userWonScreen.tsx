import * as React from "react";
import * as Redux from "redux";
import { connect } from "react-redux";

import { createResetGameAction } from "action";
import { IState } from "state";

export interface IUserWonScreen {
    dispatch: Redux.Dispatch<IState>;
    state: IState;
}

export class PureUserWonScreen extends React.Component<IUserWonScreen, {}> {
    public handleRetryButtonClick = (event: React.SyntheticEvent) => {
        this.props.dispatch(createResetGameAction());
    };

    public render() {
        return (
            <div className="rg-screen-user-won">
                <h1>{this.props.state.entities[0].name} has escaped with the Ring of Norsogoth!</h1>
                <p>Our brave hero will forever be enshrined into the halls of glory.</p>
                <button onClick={this.handleRetryButtonClick}>New Game</button>
            </div>
        );
    }
}

export const UserWonScreen = connect(
    (state: IState) => { return { state }; },
    (dispatch: Redux.Dispatch<IState>) => { return { dispatch }; }
)(PureUserWonScreen);
