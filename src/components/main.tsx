import * as React from "react";
import { connect } from "react-redux";

import { Game } from "components/game";
import { UserDiedScreen } from "components/userDiedScreen";
import { UserWonScreen } from "components/userWonScreen";
import { IState, Screen } from "state";
import { badTypeError } from "util";
import * as classnames from "classnames";
import DEBUG_FLAGS from "debugFlags";

import "./main.less";

export interface IMainProps {
    screen: Screen;
}

export class PureMain extends React.Component<IMainProps, {}> {
    public render() {
        const className = classnames("rg-main-container", { "no-animation": DEBUG_FLAGS.noAnimation });
        return (
            <div className={className}>
                { this.renderScreen() }
            </div>
        )
    }

    private renderScreen() {
        if (this.props.screen === "play") {
            return <Game />;
        } else if (this.props.screen === "user-died") {
            return <UserDiedScreen />;
        } else if (this.props.screen === "user-won") {
            return <UserWonScreen />;
        } else {
            return badTypeError(this.props.screen);
        }
    }
}

export const Main = connect(
    (state: IState) => { return { screen: state.screen }; },
)(PureMain);
