"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ReactDOM = require("react-dom");
var React = require("react");
var Redux = require("redux");
var react_redux_1 = require("react-redux");
require("./index.less");
var EntityType;
(function (EntityType) {
    EntityType[EntityType["USER"] = 0] = "USER";
    EntityType[EntityType["MERCURY"] = 1] = "MERCURY";
})(EntityType || (EntityType = {}));
var Tile;
(function (Tile) {
    Tile[Tile["SPACE"] = 0] = "SPACE";
    Tile[Tile["WALL"] = 1] = "WALL";
})(Tile || (Tile = {}));
var INITIAL_STATE = {
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
var Direction = {
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
};
function createMoveAction(direction) {
    return {
        direction: direction,
        type: "MOVE_ACTION"
    };
}
function handleMoveAction(state, action) {
    var newUser = {
        type: EntityType.USER,
        x: state.entities[0].x + action.direction.x,
        y: state.entities[0].y + action.direction.y
    };
    return {
        map: state.map,
        entities: [newUser].concat(state.entities.splice(1))
    };
}
function reducer(state, action) {
    if (state === void 0) { state = INITIAL_STATE; }
    if (action.type === "MOVE_ACTION") {
        return handleMoveAction(state, action);
    }
    else {
        return state;
    }
}
var store = Redux.createStore(reducer);
var PureGame = (function (_super) {
    __extends(PureGame, _super);
    function PureGame() {
        _super.apply(this, arguments);
    }
    PureGame.prototype.iconClassForTile = function (tile) {
        switch (tile) {
            case Tile.SPACE: return 'fa-square-o invisible';
            case Tile.WALL: return 'fa-stop';
        }
    };
    PureGame.prototype.elementForTile = function (tile) {
        return React.createElement("i", {className: "fa tile " + this.iconClassForTile(tile)});
    };
    PureGame.prototype.onKeyPress = function (event) {
        var mapping = {
            KeyW: Direction.UP,
            KeyA: Direction.LEFT,
            KeyS: Direction.DOWN,
            KeyD: Direction.RIGHT
        };
        if (mapping[event.code]) {
            this.props.dispatch(createMoveAction(mapping[event.code]));
        }
    };
    PureGame.prototype.componentDidMount = function () {
        var _this = this;
        document.addEventListener("keypress", function (event) { return _this.onKeyPress(event); }, false);
    };
    PureGame.prototype.iconClassForEntity = function (entity) {
        switch (entity.type) {
            case EntityType.USER: return 'fa-user';
            case EntityType.MERCURY: return 'fa-mercury';
        }
    };
    PureGame.prototype.elementForEntity = function (entity) {
        var style = {
            left: entity.x * 20,
            top: entity.y * 20
        };
        return React.createElement("i", {style: style, className: "fa entity " + this.iconClassForEntity(entity)});
    };
    PureGame.prototype.render = function () {
        var _this = this;
        return (React.createElement("pre", {className: "wrapper"}, this.props.map.map(function (row) {
            return (React.createElement("div", {className: "row"}, row.map(function (tile) { return _this.elementForTile(tile); })));
        }), this.props.entities.map(function (entity) { return _this.elementForEntity(entity); })));
    };
    return PureGame;
}(React.Component));
var Game = react_redux_1.connect(function (state) {
    return state;
})(PureGame);
ReactDOM.render(React.createElement(react_redux_1.Provider, {store: store}, React.createElement(Game, null)), document.getElementById("root"));
