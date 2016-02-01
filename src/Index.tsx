/// <reference path="../typings/tsd.d.ts" />
/* tslint:disable */

import ReactDOM = require("react-dom");

import * as React from "react";
import * as Redux from "redux";
import { connect, Provider } from "react-redux";
// import {repeat, clone} from "./util";

function repeat(times: number, f: Function): void {
    for (let x: number = 0; x < times; x += 1) {
        f();
    }
}

function clone<T>(t: T): T {
    return JSON.parse(JSON.stringify(t));
}

import "./index.less";

interface IAction {
    type: string;
}

interface Position {
    x: number;
    y: number;
}

enum EntityType {
    USER,
    MERCURY
}

interface IEntity extends Position {
    health: number;
    maxHealth: number;
    type: EntityType;
    name?: string;
}

enum TileType {
    SPACE = 0,
    WALL = 1,
    DOWNSTAIRS = 2
}

interface Tile {
    visible: boolean;
    type: TileType;
}

interface ILevel {
    map: Tile[][];
    entities: IEntity[];
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


class LifeLikeCA {
    public map: Tile[][];
    public survive: boolean[];
    public birth: boolean[];

    constructor(map: Tile[][], surviveBirth: string) {
        // deep clone map
        this.map = clone(map);
        const [surviveString, birthString] = surviveBirth.split("/");
        this.survive = [];
        this.birth = [];
        for(let i = 0; i <= 8; i++) {
            if (surviveString.indexOf(`${i}`) !== -1) {
                this.survive[i] = true;
            } else {
                this.survive[i] = false;
            }

            if (birthString.indexOf(`${i}`) !== -1) {
                this.birth[i] = true;
            } else {
                this.birth[i] = false;
            }
        }
    }

    get width() {
        return this.map[0].length;
    }

    get height() {
        return this.map.length;
    }

    private getNumAliveNeighbors(x: number, y: number) {
        let numAlive = 0;
        for(let yi = y - 1; yi <= y + 1; yi += 1) {
            if (this.map[yi] != null) {
                for(let xi = x - 1; xi <= x + 1; xi += 1) {
                    if (!(yi === y && xi === x) && this.map[yi][xi] != null && this.map[yi][xi].type === TileType.WALL) {
                        numAlive += 1;
                    }
                }
            }
        }
        return numAlive;
    }

    private computeNextState(x: number, y: number): Tile {
        const currentState = this.map[y][x];
        const aliveNeighbors = this.getNumAliveNeighbors(x, y);
        let type: TileType = currentState.type;
        switch(currentState.type) {
            case TileType.SPACE:
                if (this.birth[aliveNeighbors] == true) {
                    type = TileType.WALL;
                } else {
                    type = TileType.SPACE;
                }
                break;
            case TileType.WALL:
                if (this.survive[aliveNeighbors] == true) {
                    type = TileType.WALL;
                } else {
                    type = TileType.SPACE;
                }
                break;
        }
        return {
            visible: currentState.visible,
            type: type
        };
    }

    simulate(): Tile[][] {
        const {width, height} = this;
        // clone map
        const newMap = clone(this.map);
        for(let y = 0; y < height; y += 1) {
            for(let x = 0; x < width; x += 1) {
                const nextState = this.computeNextState(x, y);
                newMap[y][x] = nextState;
            }
        }
        this.map = newMap;
        return this.map;
    }
}

function generateRandomWalls(width: number, height: number, percentage: number) {
    const map: Tile[][] = [];
    for(let y = 0; y < height; y += 1) {
        const row = [];
        for(let x = 0; x < width; x += 1) {
            row.push({
                visible: false,
                type: Math.random() < percentage ? TileType.WALL : TileType.SPACE
            });
        }
        map.push(row);
    }
    const downstairsX = Math.floor(Math.random() * width);
    const downstairsY = Math.floor(Math.random() * height);
    map[downstairsY][downstairsX].type = TileType.DOWNSTAIRS;
    return map;
}

// ignores the first start position. callback should return TRUE if we should stop iteration
function forEachOnLineInGrid(start: Position, end: Position, callback: (Position) => boolean) {
    let x0 = start.x;
    let y0 = start.y;

    const x1 = end.x;
    const y1 = end.y;

    // bresenham's (http://stackoverflow.com/a/4672319)
    var dx = Math.abs(x1-x0);
    var dy = Math.abs(y1-y0);
    var sx = (x0 < x1) ? 1 : -1;
    var sy = (y0 < y1) ? 1 : -1;
    var err = dx-dy;

    while(true){
      if ((x0==x1) && (y0==y1)) break;
      var e2 = 2*err;
      if (e2 >-dy){ err -= dy; x0  += sx; }
      if (e2 < dx){ err += dx; y0  += sy; }

      const shouldStop = callback({x: x0, y: y0});
      if (shouldStop) break;
    }
}

// In-place mutation of map.
function giveVision(map: Tile[][], center: Position, radius: number): string[] {
    const discoveryTexts: string[] = [];
    for(let y = center.y - radius; y <= center.y + radius; y += 1) {
        if (map[y] != null) {
            for(let x = center.x - radius; x <= center.x + radius; x += 1) {
                const isInCircle = (x - center.x) * (x - center.x) + (y - center.y) * (y - center.y) < radius*radius;
                const tile = map[y][x];
                if (tile != null && isInCircle && !tile.visible) {
                    // raycast towards center; if you hit a wall, then don't be visible. otherwise, be visible.
                    var isVisionBlocked = false;
                    forEachOnLineInGrid({x, y}, center, (position) => {
                        if (map[position.y][position.x].type === TileType.WALL) {
                            isVisionBlocked = true;
                            return true;
                        }
                    });
                    tile.visible = !isVisionBlocked;
                    if (tile.visible && tile.type === TileType.DOWNSTAIRS) {
                        discoveryTexts.push("You discover a pathway down!");
                    }
                }
            }
        }
    }
    return discoveryTexts;
}

function generateMap() {
    let initialMap = generateRandomWalls(60, 30, 0.25);
    const caStep0 = new LifeLikeCA(initialMap, "1234/3");
    repeat(5, () => caStep0.simulate());
    const caStep1 = new LifeLikeCA(caStep0.map, "45678/3");
    repeat(100, () => caStep1.simulate());
    const caStep2 = new LifeLikeCA(caStep1.map, "1234/3");
    repeat(7, () => caStep2.simulate());
    return caStep2.map;
}

const initialMap = generateMap();
giveVision(initialMap, {x: 30, y: 15}, 7);
const INITIAL_STATE: IState = {
    levels: [{
        map: initialMap,
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
        const newUser: IEntity = {
            type: user.type,
            x: user.x + action.direction.x,
            y: user.y + action.direction.y,
            health: user.health,
            maxHealth: user.maxHealth,
            name: user.name
        };
        const newMap = clone(userLevel.map);
        discoveryTexts = giveVision(newMap, newUser, 7);
        return {
            map: newMap,
            entities: [newUser, ...userLevel.entities.slice(1)]
        };
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
        const ca = new LifeLikeCA(level.map, action.ruleset);
        const newMap = ca.simulate();
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

    const newMap = levels[newLevelIndex].map;
    const discoveryTexts = giveVision(newMap, user, 7);
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
            {this.props.level.map.map((row) => {
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
