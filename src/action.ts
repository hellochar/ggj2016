/* tslint:disable */

import * as _ from "lodash";

import * as Entity from "./model/entity";
import { Level, TileType } from "./model/level";
import { IState } from "./state";
import { Position } from "./math";

export function findUserLevel(levels: { [id: string]: Level}) {
    return _.find(levels, (level) => {
        return level.entities.some((id) => id === "0");
    });
}

export function updateUserLevel(state: IState, update: (level: Level) => { level: Level, user?: Entity.Entity }): IState {
    const userLevel = findUserLevel(state.levels);
    const { level, user } = update(userLevel);

    const newState = _.assign({}, state, {
        levels: _.assign({}, state.levels, {
            [userLevel.id]: level
        }),
    });

    if (user != null) {
        newState.entities = _.assign({}, state.entities, {
            [user.id]: user,
        });
    }

    return newState;
}


export interface IAction {
    type: string;
}

export interface IMoveAction extends IAction {
    direction: Position;
}
export function createMoveAction(direction: Position): IMoveAction {
    return {
        direction: direction,
        type: "MOVE_ACTION"
    };
}

export function handleMoveAction(state: IState, action: IMoveAction): IState {

    return updateUserLevel(state, (userLevel) => {
        const user: Entity.User = state.entities["0"];
        const newPositionTile = userLevel.map.get(user.position.x + action.direction.x,
                                                  user.position.y + action.direction.y);
        if (newPositionTile == null || newPositionTile.type === TileType.WALL) {
            return {
                level: userLevel,
                user: user
            };
        } else {
            const newUser = user.clone();
            newUser.move(action.direction);

            const newMap = userLevel.map.clone();
            newMap.removeVision(user.position, 7);
            newMap.giveVision(newUser.position, 7);

            return {
                level: new Level(userLevel.id, newMap, userLevel.entities),
                user: newUser
            };
        }
    });
}

export interface IMapEvolveAction extends IAction {
    ruleset: string;
}
export function createMapEvolveAction(ruleset: string): IMapEvolveAction {
    return {
        ruleset,
        type: "MAP_EVOLVE"
    };
}

export function handleMapEvolveAction(state: IState, action: IMapEvolveAction): IState {
    return updateUserLevel(state, (level: Level) => {
        const newMap = level.map.clone();
        newMap.lifelikeEvolve(action.ruleset);
        return {
            level: new Level(level.id, newMap, level.entities),
        };
    });
}

export interface IChangeLevelAction extends IAction {
    newLevel: number;
}
export function createChangeLevelAction(newLevel: number): IChangeLevelAction {
    return {
        newLevel,
        type: "CHANGE_LEVEL"
    }
}

export function handleChangeLevelAction(state: IState, action: IChangeLevelAction): IState {
    // delete entity from old level
    const newLevelId = state.levelOrder[action.newLevel];
    let user: Entity.User;
    const newState = updateUserLevel(state, (level) => {
        return { level: new Level(level.id, level.map, level.entities.slice(1)) };
    });

    const newMap = newState.levels[newLevelId].map.clone();
    newMap.giveVision(user.position, 7);
    const newLevel = new Level(newLevelId, newMap, [user.id, ...newState.levels[newLevelId].entities]);

    const newLevels = _.assign({}, newState.levels, {
        [newLevelId]: newLevel
    });

    return _.assign({}, newState, {
        levels: newLevels
    });
}
