import * as React from "react";
import { connect } from "react-redux";

import { IState } from "state";

import { Game } from "components/game";
import { GameOverScreen } from "components/gameOver";

export interface IMainProps {
    userDead: boolean;
}

export class PureMain extends React.Component<IMainProps, {}> {
    public render() {
        return this.props.userDead ?
            <GameOverScreen /> : <Game />;
    }
}

export const Main = connect(
    (state: IState) => { return { userDead: state.userDead }; },
)(PureMain);
