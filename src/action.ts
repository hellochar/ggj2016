/* tslint:disable */

import * as Entity from "./entity";
import { Level, TileType } from "./level";
import { IState } from "./state";
import { Position } from "./math";

export function findUserLevel(levels: Level[]) {
    return levels.filter((level) => level.entities.some((entity) => entity instanceof Entity.User))[0];
}

export function updateUserLevel(state: IState, update: (level: Level) => Level) {
    const userLevel = findUserLevel(state.levels),
          userLevelIndex = state.levels.indexOf(userLevel);

    const newLevel = update(userLevel);

    return {
        levels: [
            ...state.levels.slice(0, userLevelIndex),
            newLevel,
            ...state.levels.slice(userLevelIndex + 1)
        ],
    }
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

    const {levels} = updateUserLevel(state, (userLevel) => {
        const user: Entity.User = userLevel.entities[0];
        const newPositionTile = userLevel.map.get(user.position.x + action.direction.x,
                                                  user.position.y + action.direction.y);
        if (newPositionTile == null || newPositionTile.type === TileType.WALL) {
            return userLevel;
        } else {
            const newUser = user.clone();
            newUser.move(action.direction);

            const newMap = userLevel.map.clone();
            newMap.removeVision(user.position, 7);
            newMap.giveVision(newUser.position, 7);

            return new Level(newMap, [newUser, ...userLevel.entities.slice(1)]);
        }
    });

    return {
        levels
    };
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
        return new Level(newMap, level.entities);
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

export function handleChangeLevelAction(state: IState, action: IChangeLevelAction) {
    // delete entity from old level
    const newLevelIndex = action.newLevel;
    let user: Entity.User;
    const { levels } = updateUserLevel(state, (level) => {
        user = level.entities[0];
        return new Level(level.map, level.entities.slice(1));
    });

    const newMap = levels[newLevelIndex].map.clone();
    newMap.giveVision(user.position, 7);
    const newLevel = new Level(newMap, [user, ...levels[newLevelIndex].entities.slice(1)]);

    const newLevels = [
        ...levels.slice(0, newLevelIndex),
        newLevel,
        ...levels.slice(newLevelIndex + 1)
    ];

    return { levels: newLevels };
}
