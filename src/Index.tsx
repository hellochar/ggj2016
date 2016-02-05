/// <reference path="../typings/tsd.d.ts" />
/* tslint:disable */

import ReactDOM = require("react-dom");

import * as React from "react";
import * as Redux from "redux";
import { connect, Provider } from "react-redux";

import { forEachOnLineInGrid, Position } from "./math";
import * as Entity from "./entity";
import { Level, Tile, TileType, generateMap } from "./level";
import {repeat, clone} from "./util";

import "./index.less";

interface IAction {
    type: string;
}

interface IState {
    levels: Level[];
    textHistory: string[];
}

function findUserLevel(levels: Level[]) {
    return levels.filter((level) => level.entities.some((entity) => entity instanceof Entity.User))[0];
}

function updateUserLevel(state: IState, update: (level: Level) => Level) {
    const userLevel = findUserLevel(state.levels),
          userLevelIndex = state.levels.indexOf(userLevel);

    const newLevel = update(userLevel);

    return {
        levels: [
            ...state.levels.slice(0, userLevelIndex),
            newLevel,
            ...state.levels.slice(userLevelIndex + 1)
        ],
        textHistory: state.textHistory
    }
}

function buildLevels() {
    const center = {x: 30, y: 15};
    const level0 = new Level(generateMap(center),
        [
            new Entity.User(center),
            new Entity.Mercury({x:2, y: 2})
        ]
    );
    level0.map.giveVision(center, 7);
    const levels = [level0];
    for(let depth = 1; depth < 1; depth += 1) {
        const newMap = generateMap(levels[depth - 1].map.getDownstairsPosition());
        const currentLevel = new Level(newMap, []);
        levels[depth] = currentLevel;
    }
    const lastLevel = levels[levels.length - 1];
    const ringPosition = lastLevel.map.getDownstairsPosition();
    lastLevel.map.setImportantTile(ringPosition, TileType.DECORATIVE_SPACE);
    const ringEntity = new Entity.Ring(ringPosition);
    lastLevel.entities.push(ringEntity);
    return levels;
}
const INITIAL_STATE: IState = {
    levels: buildLevels(),
    textHistory: [
        "Welcome, hellochar, to the Peregrin Caves! You hear the light trickling of water nearby. The damp moss crunches underneath your feet. The dungeon glows with an eerie light.",
        "Mercury is on this level!"
    ]
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

interface IMoveAction extends IAction {
    direction: Position;
}
function createMoveAction(direction: Position): IMoveAction {
    return {
        direction: direction,
        type: "MOVE_ACTION"
    };
}

function handleMoveAction(state: IState, action: IMoveAction): IState {
    let discoveryTexts: string[] = [];

    const {levels, textHistory} = updateUserLevel(state, (userLevel) => {
        const user: Entity.User = userLevel.entities[0];
        const newPositionTile = userLevel.map.get(user.position.x + action.direction.x, user.position.y + action.direction.y);
        if (newPositionTile == null || newPositionTile.type === TileType.WALL) {
            return userLevel;
        } else {
            const newUser = user.clone();
            newUser.move(action.direction);

            const newMap = userLevel.map.clone();
            newMap.removeVision(user.position, 7);
            discoveryTexts = newMap.giveVision(newUser.position, 7);

            return new Level(newMap, [newUser, ...userLevel.entities.slice(1)]);
        }
    });

    return {
        levels,
        textHistory: [...textHistory, ...discoveryTexts]
    };
}

interface IMapEvolveAction extends IAction {
    ruleset: string;
}
function createMapEvolveAction(ruleset: string): IMapEvolveAction {
    return {
        ruleset,
        type: "MAP_EVOLVE"
    };
}

function handleMapEvolveAction(state: IState, action: IMapEvolveAction): IState {
    return updateUserLevel(state, (level: Level) => {
        const newMap = level.map.clone();
        newMap.lifelikeEvolve(action.ruleset);
        return new Level(newMap, level.entities);
    });
}

interface IChangeLevelAction extends IAction {
    newLevel: number;
}
function createChangeLevelAction(newLevel: number): IChangeLevelAction {
    return {
        newLevel,
        type: "CHANGE_LEVEL"
    }
}

function handleChangeLevelAction(state: IState, action: IChangeLevelAction) {
    // delete entity from old level
    const newLevelIndex = action.newLevel;
    let user: Entity.User;
    const {levels, textHistory} = updateUserLevel(state, (level) => {
        user = level.entities[0];
        return new Level(level.map, level.entities.slice(1));
    });

    const newMap = levels[newLevelIndex].map.clone();
    const discoveryTexts = newMap.giveVision(user.position, 7);
    const newLevel = new Level(newMap, [user, ...levels[newLevelIndex].entities.slice(1)]);

    const newLevels = [
        ...levels.slice(0, newLevelIndex),
        newLevel,
        ...levels.slice(newLevelIndex + 1)
    ];

    return {
        levels: newLevels,
        textHistory: [...textHistory, `You have entered floor ${newLevelIndex + 1}.`, ...discoveryTexts]
    };
}

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

const store = Redux.createStore(reducer);


class PureEntityInfo extends React.Component<{entity: Entity.Entity, floor: number}, {}> {
    render() {
        const {entity} = this.props;
        return <div className="entity-info">
            <h3>{entity.name} (floor {this.props.floor + 1})</h3>
            <p>{entity.health} / {entity.maxHealth}</p>
        </div>;
    }
}

class PureLevel extends React.Component<{level: Level}, {}> {
    iconClassForTile(tile: TileType) {
        switch(tile) {
            case TileType.SPACE: return 'fa-square-o space';
            case TileType.WALL: return 'fa-stop';
            case TileType.DOWNSTAIRS: return 'fa-chevron-down';
            case TileType.UPSTAIRS: return 'fa-chevron-up';
            case TileType.DECORATIVE_SPACE: return 'fa-slack space';
        }
    }

    elementForTile(tile: Tile) {
        if (tile.visible) {
            return <i className={`fa tile tile-visible ${this.iconClassForTile(tile.type)}`}></i>;
        } if (tile.explored) {
            return <i className={`fa tile tile-remembered ${this.iconClassForTile(tile.type)}`}></i>;
        } else {
            return <i className="fa tile tile-unexplored"> </i>;
        }
    }

    elementForEntity(entity: Entity.Entity) {
        const style = {
            left: entity.position.x * 25,
            top: entity.position.y * 25
        };
        return <i style={style} className={`fa entity ${entity.iconClass()}`}></i>
    }

    render() {
        return <pre className="map">
            {this.props.level.map.getTiles().map((row) => {
                return (
                    <div className="row">
                        {row.map((tile) => this.elementForTile(tile))}
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

interface IGameProps extends React.Props<{}> {
    dispatch?: Redux.Dispatch;

    levels?: Level[];
    textHistory?: string[];
}

class PureGame extends React.Component<IGameProps, {}> {
    onKeyPress(event: any) {
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
    }

    public componentDidMount() {
        document.addEventListener("keypress", (event) => this.onKeyPress(event), false);
    }

    render() {
        const userLevel = findUserLevel(this.props.levels),
              userLevelIndex = this.props.levels.indexOf(userLevel);

        return (
            <div className="game">
                <PureLevel level={userLevel} />
                <div className="hud">
                    <PureEntityInfo entity={userLevel.entities[0]}
                                    floor={userLevelIndex}/>
                    <ul className="history">
                        {this.props.textHistory.map((text) => <li>{text}</li>)}
                    </ul>
                </div>
            </div>
        );
    }
}

const Game = connect((state: IState) => {
    return state;
})(PureGame);

ReactDOM.render(
    <Provider store={store}>
        <Game />
    </Provider>, document.getElementById("root"));
