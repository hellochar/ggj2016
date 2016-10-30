/// <reference path="../typings/tsd.d.ts" />

import ReactDOM = require("react-dom");

import * as classnames from "classnames";
import * as _ from "lodash";
import * as React from "react";
import * as Redux from "redux";
import { connect, Provider } from "react-redux";

import { forEachOnLineInGrid, Position } from "./math";
import * as Entity from "./model/entity";
import { Level, Tile, TileType, generateMap } from "./model/level";
import * as ModelAction from "./model/action";
import reducer from "./reducer";
import { IState } from "./state";
import {repeat, clone} from "./util";
import { IAction, findEntityLevel, createPerformActionAction, createChangeLevelAction } from "./action";

import "./index.less";

class PureEntityInfo extends React.Component<{entity: Entity.Entity, floor: number}, {}> {
    public render() {
        const { entity } = this.props;
        const healthPercentage = entity.health / entity.maxHealth;
        const healthIndicatorClassnames = classnames("rg-entity-info-health", {
            "good": healthPercentage >= 0.7,
            "ok": healthPercentage < 0.7 && healthPercentage >= 0.2,
            "bad": healthPercentage <= 0.2
        });
        return (
            <div className="rg-entity-info">
                <span className="rg-entity-info-name">{entity.name}</span>
                <span className={healthIndicatorClassnames}>{entity.health} / {entity.maxHealth}</span>
                <span className="rg-entity-info-floor">floor {this.props.floor + 1}</span>
            </div>
        );
    }
}

interface IPureHeadsUpDisplayProps {
    user: Entity.Entity;
    userLevel: Level;
    userFloor: number;
}

class PureHeadsUpDisplay extends React.Component<IPureHeadsUpDisplayProps, {}> {
    public render() {
        return (
            <div className="rg-hud">
                <PureEntityInfo entity={this.props.user} floor={this.props.userFloor} />
            </div>
        );
    }
}

function mapStateToProps(state: IState): IPureHeadsUpDisplayProps {
    const userLevel = findEntityLevel("0", state.levels);
    const userFloor = state.levelOrder.indexOf(userLevel.id);
    return {
        user: state.entities["0"] as Entity.User,
        userLevel,
        userFloor,
    };
}

const HeadsUpDisplay = connect(mapStateToProps)(PureHeadsUpDisplay);

interface ILevelProps {
    getEntity: (id: string) => Entity.Entity;
    level: Level;
    center: Position;
}

class PureLevel extends React.Component<ILevelProps, {}> {
    public iconClassForTile(tile: TileType) {
        switch (tile) {
            case TileType.SPACE: return "fa-square-o space";
            case TileType.WALL: return "fa-stop";
            case TileType.DOWNSTAIRS: return "fa-chevron-down";
            case TileType.UPSTAIRS: return "fa-chevron-up";
            case TileType.DECORATIVE_SPACE: return "fa-slack space";
        }
    }

    public elementForTile(tile: Tile, x: number, y: number) {
        let visibilityClasses: string;
        if (tile.visible) {
            visibilityClasses = `tile-visible ${this.iconClassForTile(tile.type)}`;
        } else if (tile.explored) {
            visibilityClasses = `tile-remembered ${this.iconClassForTile(tile.type)}`;
        } else {
            visibilityClasses = "tile-unexplored";
        }
        const className = classnames("fa", "tile", visibilityClasses);
        return <i className={className} key={`${x},${y}`}></i>;
    }

    public elementForEntity(entity: Entity.Entity) {
        const style = {
            left: entity.position.x * 25,
            top: entity.position.y * 25
        };
        const className = classnames("fa", "entity", entity.iconClass(), {
            item: entity instanceof Entity.Item
        });
        return <i
            style={style}
            className={className}
            key={entity.id}>
            </i>;
    }

    public render() {
        const style = {
            top: `-${this.props.center.y * 25}px`,
            left: `-${this.props.center.x * 25}px`,
        };
        return <pre className="rg-map" style={style}>
            {this.props.level.map.getTiles().map((row, y) => {
                return (
                    <div className="row" key={y}>
                        {row.map((tile, x) => this.elementForTile(tile, x, y))}
                    </div>
                );
            })}
            {this.props.level.entities.map((entityId) => {
                const entity = this.props.getEntity(entityId);
                if (this.props.level.isVisible(entity.position)) {
                    return this.elementForEntity(entity);
                } else {
                    return null;
                }
            })}
        </pre>;
    }
}

interface IGameProps {
    dispatch: Redux.Dispatch<IState>;
    state: IState;
}

class PureGame extends React.Component<IGameProps, {}> {
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
        };

        const userLevel = findEntityLevel("0", this.props.state.levels);
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

const Game = connect(
    (state: IState) => { return { state }; },
    (dispatch: Redux.Dispatch<IState>) => { return { dispatch }; }
)(PureGame);

const store = Redux.createStore(reducer);

ReactDOM.render(
    <Provider store={store}>
        <Game />
    </Provider>, document.getElementById("root"));
