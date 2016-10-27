/// <reference path="../typings/tsd.d.ts" />
/* tslint:disable */

import ReactDOM = require("react-dom");

import * as classnames from "classnames";
import * as _ from "lodash";
import * as React from "react";
import * as Redux from "redux";
import { connect, Provider } from "react-redux";

import { forEachOnLineInGrid, Position } from "./math";
import * as Entity from "./entity";
import { Level, Tile, TileType, generateMap } from "./level";
import { IState } from "./state";
import {repeat, clone} from "./util";
import { IAction, findUserLevel } from "./action";

import "./index.less";

function buildLevels() {
    const center = {x: 30, y: 15};
    const level0 = new Level(generateMap(center),
        [
            new Entity.User(center),
            new Entity.Mercury({x: 2, y: 2})
        ]
    );
    level0.addLeaves();
    level0.map.giveVision(center, 7);
    const levels = [level0];
    for(let depth = 1; depth < 5; depth += 1) {
        const newMap = generateMap(levels[depth - 1].map.getDownstairsPosition());
        const currentLevel = new Level(newMap, []);
        currentLevel.addLeaves();
        levels[depth] = currentLevel;
    }
    // const lastLevel = levels[levels.length - 1];
    // const ringPosition = lastLevel.map.getDownstairsPosition();
    // lastLevel.map.setImportantTile(ringPosition, TileType.DECORATIVE_SPACE);
    // const ringEntity = new Entity.Ring(ringPosition);
    // lastLevel.entities.push(ringEntity);
    return levels;
}
const INITIAL_STATE: IState = {
    levels: buildLevels()
};

const Direction = {
    LEFT: {
        x: -1,
        y: 0
    },
    RIGHT: {
        x: 1,
        y: 0
    },
    UP: {
        x: 0,
        y: -1
    },
    DOWN: {
        x: 0,
        y: 1
    }
}

import { handleMoveAction, IMoveAction, IMapEvolveAction, createMoveAction,createMapEvolveAction,handleMapEvolveAction,IChangeLevelAction,createChangeLevelAction,handleChangeLevelAction } from "./action";
function reducer(state: IState = INITIAL_STATE, action: IAction) {
    if (action.type === "MOVE_ACTION") {
        return handleMoveAction(state, action as IMoveAction);
    } else if(action.type === "MAP_EVOLVE") {
        return handleMapEvolveAction(state, action as IMapEvolveAction);
    } else if(action.type === "CHANGE_LEVEL") {
        return handleChangeLevelAction(state, action as IChangeLevelAction);
    } else {
        return state;
    }
}

class PureEntityInfo extends React.Component<{entity: Entity.Entity, floor: number}, {}> {
    render() {
        const { entity } = this.props;
        entity.health = Math.random() * entity.maxHealth;
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
    user: Entity.User;
    userLevel: Level;
    userFloor: number;
}

class PureHeadsUpDisplay extends React.Component<IPureHeadsUpDisplayProps, {}> {
    public render() {
        return (
            <div className="rg-hud">
                <PureEntityInfo entity={this.props.user} floor={this.props.userFloor} />
            </div>
        )
    }
}

function mapStateToProps(state: IState): IPureHeadsUpDisplayProps {
    const userLevel = findUserLevel(state.levels);
    const userFloor = state.levels.indexOf(userLevel);
    return {
        user: userLevel.entities[0],
        userLevel,
        userFloor,
    };
}

const HeadsUpDisplay = connect(mapStateToProps)(PureHeadsUpDisplay);

interface ILevelProps {
    level: Level;
    center: Position;
}

class PureLevel extends React.Component<ILevelProps, {}> {
    public iconClassForTile(tile: TileType) {
        switch(tile) {
            case TileType.SPACE: return 'fa-square-o space';
            case TileType.WALL: return 'fa-stop';
            case TileType.DOWNSTAIRS: return 'fa-chevron-down';
            case TileType.UPSTAIRS: return 'fa-chevron-up';
            case TileType.DECORATIVE_SPACE: return 'fa-slack space';
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
        return <i
            style={style}
            className={`fa entity ${entity.iconClass()}`}
            key={JSON.stringify(entity)}>
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
            {this.props.level.entities.map((entity) => {
                if (this.props.level.isVisible(entity)) {
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
    levels: Level[];
}

class PureGame extends React.Component<IGameProps, {}> {
    private handleKeyPress = (event: any) => {
        const mapping = {
            KeyW: Direction.UP,
            KeyA: Direction.LEFT,
            KeyS: Direction.DOWN,
            KeyD: Direction.RIGHT
        };
        if (event.code === "KeyZ") {
            this.props.dispatch(createMapEvolveAction("45678/3"));
        }
        if (event.code === "KeyX") {
            this.props.dispatch(createMapEvolveAction("1234/3"));
        }

        const userLevel = findUserLevel(this.props.levels),
              userLevelIndex = this.props.levels.indexOf(userLevel);
        if (event.code === "KeyQ") {
            const user = userLevel.entities[0];
            const currentTile = userLevel.map.get(user.position.x, user.position.y);
            if (currentTile.type === TileType.UPSTAIRS) {
                this.props.dispatch(createChangeLevelAction(userLevelIndex - 1));
            }
        }
        if (event.code === "KeyE") {
            const user = userLevel.entities[0];
            const currentTile = userLevel.map.get(user.position.x, user.position.y);
            if (currentTile.type === TileType.DOWNSTAIRS) {
                this.props.dispatch(createChangeLevelAction(userLevelIndex + 1));
            }
        }
        if (mapping[event.code]) {
            this.props.dispatch(createMoveAction(mapping[event.code]));
        }
    };
    private throttledHandleKeyPress = _.throttle(this.handleKeyPress, 100);

    public componentDidMount() {
        // document.addEventListener("keypress", this.throttledHandleKeyPress, false);
        document.addEventListener("keydown", this.throttledHandleKeyPress, false);
        document.addEventListener("keyup", () => {
            this.throttledHandleKeyPress.flush();
            this.throttledHandleKeyPress.cancel();
        }, false);
    }

    render() {
        const userLevel = findUserLevel(this.props.levels);
        const userLevelIndex = this.props.levels.indexOf(userLevel);
        const user = userLevel.entities[0];

        return (
            <div className="rg-game">
                <div className="rg-viewport">
                    <PureLevel center={user.position} level={userLevel} />
                </div>
                <HeadsUpDisplay />
            </div>
        );
    }
}

const Game = connect(
    (state: IState) => {
        return {
            levels: state.levels,
        };
    },
    (dispatch: Redux.Dispatch<IState>) => {
        return { dispatch }
    }
)(PureGame);

const store = Redux.createStore(reducer);
ReactDOM.render(
    <Provider store={store}>
        <Game />
    </Provider>, document.getElementById("root"));
