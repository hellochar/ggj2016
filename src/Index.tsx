/// <reference path="../typings/tsd.d.ts" />
/* tslint:disable */

import ReactDOM = require("react-dom");

import * as React from "react";
import * as Redux from "redux";
import { connect, Provider } from "react-redux";

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
    type: EntityType;
}

interface IState {
    map: Tile[][];
    entities: IEntity[]; // user is entity 0
}

enum Tile {
    SPACE = 0,
    WALL = 1
}

class LifeLikeCA {
    public map: Tile[][];
    public survive: boolean[];
    public birth: boolean[];

    constructor(map: Tile[][], surviveBirth: string) {
        // deep clone map
        this.map = JSON.parse(JSON.stringify(map));
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
                    if (!(yi === y && xi === x) && this.map[yi][xi] === Tile.WALL) {
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
        switch(currentState) {
            case Tile.SPACE:
                if (this.birth[aliveNeighbors] == true) {
                    return Tile.WALL;
                } else {
                    return Tile.SPACE;
                }
            case Tile.WALL:
                if (this.survive[aliveNeighbors] == true) {
                    return Tile.WALL;
                } else {
                    return Tile.SPACE;
                }
        }
    }

    simulate(): Tile[][] {
        const {width, height} = this;
        const newMap = JSON.parse(JSON.stringify(this.map));
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

function repeat(times: number, f: Function) {
    for(var x = 0; x < times; x++) {
        f();
    }
}

function generateRandomWalls(width: number, height: number, percentage: number) {
    const map: Tile[][] = [];
    for(let y = 0; y < height; y += 1) {
        const row = [];
        for(let x = 0; x < width; x += 1) {
            row.push(Math.random() < percentage ? Tile.WALL : Tile.SPACE);
        }
        map.push(row);
    }
    return map;
}

let initialMap = generateRandomWalls(60, 30, 0.25);
const caStep0 = new LifeLikeCA(initialMap, "1234/3");
repeat(5, () => caStep0.simulate());
const caStep1 = new LifeLikeCA(caStep0.map, "45678/3");
repeat(100, () => caStep1.simulate());
const caStep2 = new LifeLikeCA(caStep1.map, "1234/3");
repeat(7, () => caStep2.simulate());
const INITIAL_STATE: IState = {
    map: caStep2.map,
    entities: [
        {
            type: EntityType.USER,
            x: 2,
            y: 3
        },
        {
            type: EntityType.MERCURY,
            x: 2,
            y: 1
        }
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
    // TODO check later
    const newUser = {
        type: EntityType.USER,
        x: state.entities[0].x + action.direction.x,
        y: state.entities[0].y + action.direction.y
    };
    return {
        map: state.map,
        entities: [newUser, ...state.entities.splice(1)]
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
    const ca = new LifeLikeCA(state.map, action.ruleset);
    const newMap = ca.simulate();
    return {
        map: newMap,
        entities: state.entities
    }
}

function reducer(state: IState = INITIAL_STATE, action: IAction) {
    if (action.type === "MOVE_ACTION") {
        return handleMoveAction(state, action as IMoveAction);
    } else if(action.type === "MAP_EVOLVE") {
        return handleMapEvolveAction(state, action as IMapEvolveAction);
    } else {
        return state;
    }
}

const store = Redux.createStore(reducer);

interface IGameProps extends React.Props<{}> {
    map?: number[][];
    entities?: IEntity[];
    dispatch?: Redux.Dispatch;
}

class PureGame extends React.Component<IGameProps, {}> {
    iconClassForTile(tile: Tile) {
        switch(tile) {
            case Tile.SPACE: return 'fa-square-o invisible';
            case Tile.WALL: return 'fa-stop';
        }
    }

    elementForTile(tile: Tile) {
        return <i className={`fa tile ${this.iconClassForTile(tile)}`}></i>;
    }

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
        if (mapping[event.code]) {
            this.props.dispatch(createMoveAction(mapping[event.code]));
        }
    }

    public componentDidMount() {
        document.addEventListener("keypress", (event) => this.onKeyPress(event), false);
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
        return (
            <pre className="wrapper">
                {this.props.map.map((row) => {
                    return (
                        <div className="row">
                            {row.map((tile) => this.elementForTile(tile))}
                        </div>
                    );
                })}
                {this.props.entities.map((entity) => this.elementForEntity(entity))}
            </pre>

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
