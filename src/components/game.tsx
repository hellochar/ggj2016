import { Dialog } from "@blueprintjs/core";
import * as _ from "lodash";
import * as React from "react";
import * as Redux from "redux";
import { connect } from "react-redux";

import { decideUserAction } from "userInput";
import { findEntityLevel, updateLevel, userPerformAction } from "action";
import { HeadsUpDisplay } from "components/headsUpDisplay";
import { PureLevel } from "components/level";
import { IState } from "state";

import "./game.less";
import { setGlobalTrigger } from "../action/simpleUpdaters";

export interface IGameProps {
    dispatch: Redux.Dispatch<IState>;
    state: IState;
}

export class PureGame extends React.Component<IGameProps, {}> {
    private handleKeyPress = (event: KeyboardEvent) => {
        if (event.code === "Space") {
            const level = findEntityLevel("0", this.props.state);
            this.props.dispatch(updateLevel(level.illuminated()));
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
                { this.maybeRenderIntroScreen() }
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

    private maybeRenderIntroScreen() {
        if (!this.props.state.globalTriggers.seenIntro) {
            return <Dialog
                autoFocus={true}
                canEscapeKeyClose={true}
                canOutsideClickClose={true}
                enforceFocus={true}
                hasBackdrop={true}
                isOpen={true}
                title="Retrieve your Grandma's Wedding Ring"
                onClose={this.handleIntroScreenClosed}
                isCloseButtonShown={true}>
                    <h3 className="rg-intro-screen-grandma">Gradma Image</h3>
                    <p className="rg-intro-screen-text">
                        My dear grandson, I've lost my <span className="rg-text-highlight-item">Wedding Ring</span> in
                        the caves! Would you retrieve that for me? It should be about, oh, <strong>200 feet</strong> down.
                        Be careful though, the depths of the cave could be dangerous! Be sure to
                        <span className="rg-text-highlight-warmth"> wear warm clothes</span>,
                        <span className="rg-text-highlight-food"> eat enough food</span>, and
                        <span className="rg-text-highlight-sleep"> sleep well</span>.
                        I'll bake you some cookies when you return.
                    </p>
                </Dialog>;
        } else {
            return null;
        }
    }

    private handleIntroScreenClosed = () => {
        this.props.dispatch(setGlobalTrigger("seenIntro", true));
    }
}

export const Game = connect(
    (state: IState) => { return { state }; },
    (dispatch: Redux.Dispatch<IState>) => { return { dispatch }; }
)(PureGame);
