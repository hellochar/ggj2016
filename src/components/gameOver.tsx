import * as React from "react";
import * as Redux from "redux";
import { connect } from "react-redux";

import { createResetGameAction } from "action";
import { IState } from "state";

export interface IGameOverScreenProps {
    dispatch: Redux.Dispatch<IState>;
    state: IState;
}

export class PureGameOverScreen extends React.Component<IGameOverScreenProps, {}> {
    public handleRetryButtonClick = (event: React.SyntheticEvent) => {
        this.props.dispatch(createResetGameAction());
    };

    public render() {
        return (
            <div className="rg-game-over">
                <h1>{this.props.state.entities[0].name} has fallen!</h1>
                <p>Our brave hero could not retrieve the Ring of Norsogoth.</p>
                <button onClick={this.handleRetryButtonClick}>Retry</button>
            </div>
        );
    }
}

export const GameOverScreen = connect(
    (state: IState) => { return { state }; },
    (dispatch: Redux.Dispatch<IState>) => { return { dispatch }; }
)(PureGameOverScreen);
