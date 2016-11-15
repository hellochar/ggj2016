import * as _ from "lodash";

import { findEntityLevel, updateEntityLevel } from "action";
import { IChangeLevelAction, handleChangeLevelAction } from "action/changeLevel";
import * as ModelActions from "model/action";
import * as Entity from "model/entity";
import { Level, TileType } from "model/level";
import { IState } from "state";
import { badTypeError } from "util";

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
        return handleMoveAction(state, action.actorId, actorAction);
    } else if (actorAction.type === "nothing") {
        return handleNothingAction(state, actor, actorAction);
    } else if (actorAction.type === "go-downstairs") {
        return handleGoDownstairsAction(state, actor, actorAction);
    } else if (actorAction.type === "go-upstairs") {
        return handleGoUpstairsAction(state, actor, actorAction);
    } else if (actorAction.type === "pick-up-item") {
        return handlePickUpItemAction(state, actor, actorAction);
    } else if (actorAction.type === "drop-item") {
        return handleDropItemAction(state, actor, actorAction);
    } else if (actorAction.type === "use-item") {
        return handleUseItemAction(state, actor, actorAction);
    } else if (actorAction.type === "create-fruit") {
        return handleCreateFruitAction(state, actor, actorAction);
    } else {
        return badTypeError(actorAction);
    }
}

function handleNothingAction(state: IState, actor: Entity.Actor, action: ModelActions.IDoNothingAction): IState {
    // shallow clone state to indicate that the action was successfully performed.
    return _.assign({}, state);
}

function handleUseItemAction(state: IState, actor: Entity.Actor, action: ModelActions.IUseItemAction): IState {
    const item = state.entities[action.itemId] as Entity.Item;
    if (item.type === "fruit") {
        // eat the fruit: remove the item from existence and satiate the user
        const newEntities = _.assign({}, state.entities);
        delete newEntities[action.itemId];

        if (actor.type === "user") {
            const newUser = _.assign({}, actor);
            newUser.satiation = 1;
            newUser.inventory = _.assign({}, newUser.inventory, {
                itemIds: _.without(newUser.inventory.itemIds, action.itemId)
            });
            newEntities[actor.id] = newUser;
        }

        return _.assign({}, state, {
            entities: _.assign({}, state.entities, newEntities)
        });
    } else {
        // cannot use the item; cancel
        return state;
    }
}

function handleMoveAction(state: IState, actorId: string, action: ModelActions.IMoveAction): IState {
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

function handleGoDownstairsAction(state: IState, actor: Entity.Actor, actorAtion: ModelActions.IGoDownstairsAction): IState {
    const actorLevel = findEntityLevel(actor.id, state.levels);
    const currentTile = actorLevel.map.get(actor.position.x, actor.position.y);
    if (currentTile.type === TileType.DOWNSTAIRS) {
        const levelIndex = state.levelOrder.indexOf(actorLevel.id);
        // COMPOSITION: dispatch a changeLevel action
        const action: IChangeLevelAction = {
            newLevel: levelIndex + 1,
            entityId: actor.id,
            type: "ChangeLevel",
        };
        return handleChangeLevelAction(state, action);
    } else {
        return state;
    }
}

function handleGoUpstairsAction(state: IState, actor: Entity.Actor, actorAtion: ModelActions.IGoUpstairsAction): IState {
    const actorLevel = findEntityLevel(actor.id, state.levels);
    const currentTile = actorLevel.map.get(actor.position.x, actor.position.y);
    if (currentTile.type === TileType.UPSTAIRS) {
        const levelIndex = state.levelOrder.indexOf(actorLevel.id);
        // COMPOSITION: dispatch a changeLevel action
        const action: IChangeLevelAction = {
            newLevel: levelIndex - 1,
            entityId: actor.id,
            type: "ChangeLevel",
        };
        return handleChangeLevelAction(state, action);
    } else {
        return state;
    }
}

function handlePickUpItemAction(state: IState, actor: Entity.Actor, actorAction: ModelActions.IPickUpItemAction): IState {
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
}

function handleDropItemAction(state: IState, actor: Entity.Actor, actorAction: ModelActions.IDropItemAction): IState {
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
}

function handleCreateFruitAction(state: IState, actor: Entity.Actor, actorAction: ModelActions.ICreateFruitAction): IState {
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
}
