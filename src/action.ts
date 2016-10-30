import * as _ from "lodash";

import * as ModelActions from "./model/action";
import * as Entity from "./model/entity";
import { Level, TileType } from "./model/level";
import { IState } from "./state";

export type IAction = IPerformActionAction | IChangeLevelAction | IIterateUntilActorTurnAction;

export function findEntityLevel(entityId: string, levels: { [id: string]: Level}) {
    return _.find(levels, (level: Level) => {
        return level.entities.some((id) => entityId === id);
    });
}

export function updateEntityLevel(
    state: IState,
    entityId: string,
    update: (level: Level) => { level?: Level, entity?: Entity.Entity }): IState {
    const userLevel = findEntityLevel(entityId, state.levels);
    const { level, entity } = update(userLevel);

    const newState = _.assign({}, state);
    let changed = false;

    if (level != null && level !== userLevel) {
        changed = true;
        newState.levels = _.assign({}, state.levels, {
            [userLevel.id]: level
        });
    }

    if (entity != null) {
        changed = true;
        newState.entities = _.assign({}, state.entities, {
            [entity.id]: entity,
        });
    }

    if (changed) {
        return newState;
    } else {
        return state;
    }
}

export interface IIterateUntilActorTurnAction {
    actorId: string;
    type: "IterateUntilActorTurn";
}
export function createIterateUntilActorTurnAction(actorId: string): IIterateUntilActorTurnAction {
    return {
        actorId,
        type: "IterateUntilActorTurn",
    };
}

export function handleIterateUntilActorTurnAction(initialState: IState, action: IIterateUntilActorTurnAction): IState {
    let state = initialState;
    while (state.turnOrder[0] !== action.actorId) {
        const actor = state.entities[state.turnOrder[0]] as Entity.Actor;
        const nextAction = Entity.decideNextAction(state, actor);
        state = handlePerformActionAction(state, {
            actorId: actor.id,
            action: nextAction,
            type: "PerformAction",
        });
        state.turnOrder = [...state.turnOrder.splice(1), state.turnOrder[0]];
    }
    return state;
}

export interface IPerformActionAction {
    actorId: string;
    action: ModelActions.Action;
    type: "PerformAction";
}
export function createPerformActionAction(actorId: string, action: ModelActions.Action): IPerformActionAction {
    return {
        actorId,
        action,
        type: "PerformAction",
    };
}

/**
 * Update state in response to the perform action action. Handles invalid actor/action combinations by returning
 * the same state reference.
 */
export function handlePerformActionAction(state: IState, action: IPerformActionAction): IState {
    const actorAction = action.action;
    const actor = state.entities[action.actorId] as Entity.Actor;
    if (actorAction.type === "move") {
        return moveAction(state, action.actorId, actorAction);
    } else if (actorAction.type === "nothing") {
        // shallow clone state to indicate that the action was successfully performed.
        return _.assign({}, state);
    } else if (actorAction.type === "go-downstairs") {
        const actorLevel = findEntityLevel(actor.id, state.levels);
        const currentTile = actorLevel.map.get(actor.position.x, actor.position.y);
        if (currentTile.type === TileType.DOWNSTAIRS) {
            const levelIndex = state.levelOrder.indexOf(actorLevel.id);
            const action: IChangeLevelAction = {
                newLevel: levelIndex + 1,
                entityId: actor.id,
                type: "ChangeLevel",
            };
            return handleChangeLevelAction(state, action);
        } else {
            return state;
        }
    } else if (actorAction.type === "go-upstairs") {
        const actorLevel = findEntityLevel(actor.id, state.levels);
        const currentTile = actorLevel.map.get(actor.position.x, actor.position.y);
        if (currentTile.type === TileType.UPSTAIRS) {
            const levelIndex = state.levelOrder.indexOf(actorLevel.id);
            const action: IChangeLevelAction = {
                newLevel: levelIndex - 1,
                entityId: actor.id,
                type: "ChangeLevel",
            };
            return handleChangeLevelAction(state, action);
        } else {
            return state;
        }
    } else {
        throw new Error(`got unknown action ${JSON.stringify(actorAction)}`);
    }
}

function moveAction(state: IState, actorId: string, action: ModelActions.IMoveAction): IState {
    const offsets = {
        "left": {
            x: -1,
            y: 0
        },
        "right": {
            x: 1,
            y: 0
        },
        "up": {
            x: 0,
            y: -1
        },
        "down": {
            x: 0,
            y: 1
        }
    };

    return updateEntityLevel(state, actorId, (level) => {
        const actor = state.entities[actorId];
        const direction = offsets[action.direction];
        const newPositionTile = level.map.get(
            actor.position.x + direction.x,
            actor.position.y + direction.y);
        if (newPositionTile == null || newPositionTile.type === TileType.WALL) {
            return { level };
        } else {
            const newActor = Entity.move(actor, direction);

            if (actorId === "0") {
                const newMap = level.map.clone();
                newMap.removeVision(actor.position, 7);
                newMap.giveVision(newActor.position, 7);
                return {
                    level: new Level(level.id, newMap, level.entities),
                    entity: newActor
                };
            } else {
                return {
                    entity: newActor
                };
            }
        }
    });
}

/**
 * Move an entity to another level. This is a basic state changing action
 * that can be used in many different situations (e.g. going upstairs,
 * teleporting, falling down a hole, etc.).
 */
export interface IChangeLevelAction {
    entityId: string;
    newLevel: number;
    type: "ChangeLevel";
}

export function createChangeLevelAction(entityId: string, newLevel: number): IChangeLevelAction {
    return {
        entityId,
        newLevel,
        type: "ChangeLevel"
    };
}

export function handleChangeLevelAction(state: IState, action: IChangeLevelAction): IState {
    // delete entity from old level
    const newLevelId = state.levelOrder[action.newLevel];
    if (newLevelId !== undefined) {
        const entity = state.entities[action.entityId];
        const newState = updateEntityLevel(state, action.entityId, (level) => {
            return { level: new Level(level.id, level.map, _.without(level.entities, action.entityId)) };
        });

        const newMap = newState.levels[newLevelId].map.clone();
        newMap.giveVision(entity.position, 7);
        const newLevel = new Level(newLevelId, newMap, [entity.id, ...newState.levels[newLevelId].entities]);

        const newLevels = _.assign({}, newState.levels, {
            [newLevelId]: newLevel
        });

        return _.assign({}, newState, {
            levels: newLevels
        });
    } else {
        return state;
    }
}
