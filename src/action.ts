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

export function handleUserDied(state: IState): IState {
    return _.assign({}, state, {
        userDead: true
    });
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
    } else if (actorAction.type === "pick-up-item") {
        const actorLevel = findEntityLevel(actor.id, state.levels);
        const item = state.entities[actorAction.itemId];
        const itemLevel = findEntityLevel(item.id, state.levels);
        if (!Entity.isItem(item)) {
            throw new Error(`tried pick-up-item on a non-item entity ${JSON.stringify(item)}`);
        }
        if (_.isEqual(item.position, actor.position) && itemLevel === actorLevel && Entity.hasInventory(actor)) {
            // TODO associate actions with Entity traits
            return updateEntityLevel(state, actor.id, (level) => {
                const newLevel = new Level(level.id, level.map, _.without(actorLevel.entities, item.id));
                const newEntity = _.assign({}, actor, {
                    inventory: _.assign({}, actor.inventory, {
                        itemIds: [...actor.inventory.itemIds, item.id],
                    }),
                });
                return {
                    level: newLevel,
                    entity: newEntity,
                };
            });
        } else {
            return state;
        }
    } else if (actorAction.type === "drop-item") {
        const item = state.entities[actorAction.itemId];
        if (!Entity.isItem(item)) {
            throw new Error(`tried drop-item on a non-item ${JSON.stringify(item)}`);
        }
        if (!Entity.hasInventory(actor)) {
            throw new Error(`Actor of type ${actor.type} tried to drop-item, but has no inventory!`);
        }
        const newState = updateEntityLevel(state, actor.id, (level) => {
            const newLevel = new Level(level.id, level.map, [...level.entities, item.id]);
            const newActor: Entity.Actor = _.assign({}, actor, {
                inventory: _.assign({}, actor.inventory, {
                    itemIds: _.without(actor.inventory.itemIds, item.id),
                }),
            });
            return {
                level: newLevel,
                entity: newActor
            };
        });
        // set new item on user's position
        const newItem = _.assign({}, item, {
            position: _.assign({}, actor.position),
        });
        return _.assign({}, newState, {
            entities: _.assign({}, newState.entities, {
                [item.id]: newItem,
            }),
        });
    } else if (actorAction.type === "use-item") {
        // TODO implement later
        return _.assign({}, state);
    } else if (actorAction.type === "create-fruit") {
        const fruit: Entity.IFruit = {
            id: Math.random().toString(16).substring(2),
            position: {
                x: actor.position.x + (Math.random() < 0.5 ? -1 : 1),
                y: actor.position.y + (Math.random() < 0.5 ? -1 : 1),
            },
            type: "fruit",
        };
        const level = findEntityLevel(actor.id, state.levels);
        const newLevel = new Level(level.id, level.map, [...level.entities, fruit.id]);
        return _.assign({}, state, {
            entities: _.assign({}, state.entities, {
                [fruit.id]: fruit,
            }),
            levels: _.assign({}, state.levels, {
                [level.id]: newLevel,
            }),
        });
    } else {
        return state;
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
        const newPosition = {
            x: actor.position.x + direction.x,
            y: actor.position.y + direction.y,
        };
        const newPositionTile = level.map.get(newPosition.x, newPosition.y);
        const spaceIsOccupied = Entity.getEntitiesAtPosition(state, level.id, newPosition)
            .filter((id) => !Entity.isItem(state.entities[id]))
            .length > 0;
        if (newPositionTile == null ||
            level.map.isTileObstructed(newPosition) ||
            spaceIsOccupied) {
            // can't move there; abort action.
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
