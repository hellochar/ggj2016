import * as React from "react";
import * as Redux from "redux";
import { connect } from "react-redux";

import { createResetGameAction } from "action";
import { IState } from "state";

export interface IUserDiedScreenProps {
    dispatch: Redux.Dispatch<IState>;
    state: IState;
}

export class PureUserDiedScreen extends React.Component<IUserDiedScreenProps, {}> {
    public handleRetryButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        this.props.dispatch(createResetGameAction());
    };

    public render() {
        return (
            <div className="rg-screen-user-died">
                <h1>{this.props.state.entities[0].name} has fallen!</h1>
                <p>Our brave hero could not retrieve the Ring of Norsogoth.</p>
                <button onClick={this.handleRetryButtonClick}>Retry</button>
            </div>
        );
    }
}

export const UserDiedScreen = connect(
    (state: IState) => { return { state }; },
    (dispatch: Redux.Dispatch<IState>) => { return { dispatch }; }
)(PureUserDiedScreen);
