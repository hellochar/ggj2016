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
    map: number[][];
    entities: IEntity[]; // user is entity 0
}

enum Tile {
    SPACE = 0,
    WALL = 1
}

const INITIAL_STATE: IState = {
    map: [[1, 1, 1, 1, 1],
          [1, 0, 0, 0, 1],
          [1, 0, 0, 1, 1],
          [1, 0, 0, 0, 1],
          [1, 1, 1, 1, 1]],
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
    }
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

function reducer(state: IState = INITIAL_STATE, action: IAction) {
    if (action.type === "MOVE_ACTION") {
        return handleMoveAction(state, action as IMoveAction);
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
        if (mapping[event.code]) {
            this.props.dispatch(createMoveAction(mapping[event.code]));
        }
    }

    public componentDidMount() {
        document.addEventListener("keypress", (event) => this.onKeyPress(event), false);
    }

    iconClassForEntity(entity: IEntity) {
        switch(entity.type) {
            case EntityType.USER: return 'fa-user';
            case EntityType.MERCURY: return 'fa-mercury';
        }
    }

    elementForEntity(entity: IEntity) {
        const style = {
            left: entity.x * 20,
            top: entity.y * 20
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
