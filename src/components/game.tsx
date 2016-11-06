import * as _ from "lodash";
import * as React from "react";
import * as Redux from "redux";
import { connect } from "react-redux";

import { findEntityLevel, createPerformActionAction } from "action";
import { HeadsUpDisplay } from "components/headsUpDisplay";
import { PureLevel } from "components/level";
import * as Entity from "model/entity";
import * as ModelAction from "model/action";
import { IState } from "state";

export interface IGameProps {
    dispatch: Redux.Dispatch<IState>;
    state: IState;
}

export class PureGame extends React.Component<IGameProps, {}> {
    private handleKeyPress = (event: KeyboardEvent) => {
        const mapping: { [key: string]: ModelAction.Action } = {
            KeyW: {
                direction: "up",
                type: "move",
            },
            KeyA: {
                direction: "left",
                type: "move",
            },
            KeyS: {
                direction: "down",
                type: "move",
            },
            KeyD: {
                direction: "right",
                type: "move",
            },
            KeyQ: {
                type: "go-upstairs",
            },
            KeyE: {
                type: "go-downstairs",
            },
            Period: {
                type: "nothing",
            },
        };

        const user = this.props.state.entities["0"];
        // add pick-up-item if available
        const itemsBeneathUser = Entity.getEntitiesAtPosition(
            this.props.state,
            findEntityLevel("0", this.props.state.levels).id,
            user.position
        ).filter((entityId) => {
            return Entity.isItem(this.props.state.entities[entityId]);
        });
        if (itemsBeneathUser.length > 0) {
            mapping["KeyG"] = {
                itemId: itemsBeneathUser[0],
                type: "pick-up-item",
            };
        }

        if (user.inventory.itemIds.length > 0) {
            mapping["KeyP"] = {
                itemId: user.inventory.itemIds[0],
                type: "drop-item",
            };
        }

        if (mapping[event.code]) {
            this.props.dispatch(createPerformActionAction("0", mapping[event.code]));
        }
    };
    private throttledHandleKeyPress = _.throttle(this.handleKeyPress, 100);

    public componentDidMount() {
        document.addEventListener("keydown", this.throttledHandleKeyPress, false);
        document.addEventListener("keyup", () => {
            this.throttledHandleKeyPress.flush();
            this.throttledHandleKeyPress.cancel();
        }, false);
    }

    public render() {
        const userLevel = findEntityLevel("0", this.props.state.levels);
        const user = this.props.state.entities["0"];
        const getEntity = (e: string) => this.props.state.entities[e];

        return (
            <div className="rg-game">
                <div className="rg-viewport">
                    <PureLevel center={user.position} getEntity={getEntity} level={userLevel} />
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
