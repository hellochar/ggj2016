/// <reference path="../typings/tsd.d.ts" />
/* tslint:disable */

import ReactDOM = require("react-dom");

import * as React from "react";
import * as Redux from "redux";
import { connect, Provider } from "react-redux";

import { forEachOnLineInGrid, Position } from "./math";
import { IEntity, EntityType } from "./entity";
import { ILevel, Tile, TileType, generateMap } from "./level";
import {repeat, clone} from "./util";

import "./index.less";

interface IAction {
    type: string;
}

interface IState {
    levels: ILevel[];
    textHistory: string[];
}

function findUserLevel(levels: ILevel[]) {
    return levels.filter((level) => level.entities.some((entity) => entity.type === EntityType.USER))[0];
}

function updateUserLevel(state: IState, update: (ILevel) => ILevel) {
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

const level0 = generateMap();
level0.giveVision({x: 30, y: 15}, 7);
const INITIAL_STATE: IState = {
    levels: [{
        map: level0,
        entities: [
            {
                type: EntityType.USER,
                x: 30,
                y: 15,
                health: 10,
                maxHealth: 10,
                name: "hellochar"
            },
            {
                type: EntityType.MERCURY,
                x: 2,
                y: 1,
                health: 25,
                maxHealth: 25,
                name: "Mercury"
            }
        ],
    },
    {
        map: generateMap(),
        entities: []
    },
    {
        map: generateMap(),
        entities: []
    },
    {
        map: generateMap(),
        entities: []
    },
    {
        map: generateMap(),
        entities: []
    },
    {
        map: generateMap(),
        entities: []
    },
    {
        map: generateMap(),
        entities: []
    },
    {
        map: generateMap(),
        entities: []
    },
    {
        map: generateMap(),
        entities: []
    },
    {
        map: generateMap(),
        entities: []
    }],
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
        const user = userLevel.entities[0];
        if (userLevel.map.tiles[user.y + action.direction.y][user.x + action.direction.x].type === TileType.WALL) {
            return userLevel;
        } else {
            const newUser: IEntity = {
                type: user.type,
                x: user.x + action.direction.x,
                y: user.y + action.direction.y,
                health: user.health,
                maxHealth: user.maxHealth,
                name: user.name
            };
            const newMap = userLevel.map.clone();
            discoveryTexts = newMap.giveVision(newUser, 7);
            return {
                map: newMap,
                entities: [newUser, ...userLevel.entities.slice(1)]
            };
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
    return updateUserLevel(state, (level: ILevel) => {
        const newMap = level.map.clone();
        newMap.lifelikeEvolve(action.ruleset);
        return {
            map: newMap,
            entities: level.entities
        };
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
    let user: IEntity;
    const {levels, textHistory} = updateUserLevel(state, (level: ILevel) => {
        user = level.entities[0];
        return {
            map: level.map,
            entities: level.entities.slice(1)
        };
    });

    const newMap = levels[newLevelIndex].map.clone();
    const discoveryTexts = newMap.giveVision(user, 7);
    const newLevel: ILevel = {
        map: newMap,
        entities: [user, ...levels[newLevelIndex].entities.slice(1)]
    }

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


class PureEntityInfo extends React.Component<{entity: IEntity, floor: number}, {}> {
    render() {
        const {entity} = this.props;
        return <div className="entity-info">
            <h3>{entity.name} (floor {this.props.floor + 1})</h3>
            <p>{entity.health} / {entity.maxHealth}</p>
        </div>;
    }
}

class PureLevel extends React.Component<{level: ILevel}, {}> {
    iconClassForTile(tile: TileType) {
        switch(tile) {
            case TileType.SPACE: return 'fa-square-o space';
            case TileType.WALL: return 'fa-stop';
            case TileType.DOWNSTAIRS: return 'fa-chevron-down';
        }
    }

    elementForTile(tile: Tile) {
        if (tile.visible) {
            return <i className={`fa tile ${this.iconClassForTile(tile.type)}`}></i>;
        } else {
            return <i className="fa tile unexplored"> </i>;
        }
    }

    iconClassForEntity(entity: IEntity) {
        switch(entity.type) {
            case EntityType.USER: return 'fa-user user';
            case EntityType.MERCURY: return 'fa-mercury';
        }
    }

    elementForEntity(entity: IEntity) {
        const style = {
            left: entity.x * 25,
            top: entity.y * 25
        };
        return <i style={style} className={`fa entity ${this.iconClassForEntity(entity)}`}></i>
    }

    render() {
        return <pre className="map">
            {this.props.level.map.tiles.map((row) => {
                return (
                    <div className="row">
                        {row.map((tile) => this.elementForTile(tile))}
                    </div>
                );
            })}
            {this.props.level.entities.map((entity) => this.elementForEntity(entity))}
        </pre>;
    }
}

interface IGameProps extends React.Props<{}> {
    dispatch?: Redux.Dispatch;

    levels?: ILevel[];
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
            this.props.dispatch(createChangeLevelAction(userLevelIndex - 1));
        }
        if (event.code === "KeyE") {
            this.props.dispatch(createChangeLevelAction(userLevelIndex + 1));
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
                    <pre>
                    {this.props.levels.length}
                    </pre>
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
