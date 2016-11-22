import * as _ from "lodash";
import * as Redux from "redux";

import {
    entityChangeLevel,
    entityDelete,
    entityUpdate,
    findEntityLevel,
    iterateUntilActorTurn,
    rotateTurnOrder,
    setScreen,
    updateLevel,
} from "action";
import * as ModelActions from "model/action";
import * as Entity from "model/entity";
import { Level } from "model/level";
import { TileType } from "model/tile";
import { IState } from "state";
import { badTypeError } from "util";

export function userPerformAction(action: ModelActions.Action) {
    return (dispatch: Redux.Dispatch<IState>, getState: () => IState) => {
        const state = getState();
        dispatch(actorPerformAction("0", action));
        const nextState = getState();

        if (nextState !== state) {
            // move user to the end of the turn order
            dispatch(rotateTurnOrder());

            // make user a bit hungrier
            const user = _.assign({}, nextState.entities[0]);
            user.satiation = Math.max(0, user.satiation - 0.001);
            if (user.satiation <= 0) {
                // user is starving - start dealing damage
                user.health -= 1;
            }
            // kill user if dead
            if (user.health <= 0) {
                dispatch(setScreen("user-died"));
            } else {
                dispatch(entityUpdate(user));
                // take NPC turns until it's the user turn again
                dispatch(iterateUntilActorTurn("0"));
            }
        }
    };
}

/**
 * Update state in response to the perform action action. Handles invalid actor/action combinations by returning
 * the same state reference.
 */
export function actorPerformAction(actorId: string, action: ModelActions.Action) {
    return (dispatch: Redux.Dispatch<IState>, getState: () => IState) => {
        const state = getState();
        const actor = getState().entities[actorId] as Entity.Actor;
        function getThunk() {
            if (action.type === "move") {
                return handleMoveAction(state, actorId, action);
            } else if (action.type === "nothing") {
                return handleNothingAction(state, actor, action);
            } else if (action.type === "go-downstairs") {
                return handleGoDownstairsAction(state, actor, action);
            } else if (action.type === "go-upstairs") {
                return handleGoUpstairsAction(state, actor, action);
            } else if (action.type === "pick-up-item") {
                return handlePickUpItemAction(state, actor, action);
            } else if (action.type === "drop-item") {
                return handleDropItemAction(state, actor, action);
            } else if (action.type === "use-item") {
                return handleUseItemAction(state, actor, action);
            } else if (action.type === "use-item-target") {
                return handleUseItemTargettedAction(state, actor, action);
            } else if (action.type === "create-fruit") {
                return handleCreateFruitAction(state, actor, action);
            } else {
                return badTypeError(action);
            }
        }
        dispatch(getThunk());
    };
}

function handleNothingAction(state: IState, actor: Entity.Actor, action: ModelActions.IDoNothingAction) {
    return (dispatch: Redux.Dispatch<IState>, getState: () => IState) => {
        // do nothing by making a shallow clone of the changed actor.
        dispatch(entityUpdate(_.assign({}, actor)));
    };
}

function handleUseItemAction(state: IState, actor: Entity.Actor, action: ModelActions.IUseItemAction) {
    const item = state.entities[action.itemId] as Entity.Item;

    return (dispatch: Redux.Dispatch<IState>, getState: () => IState) => {
        if (item.type === "fruit") {
            // eat the fruit: remove the item from existence and satiate the user
            dispatch(entityDelete(action.itemId));

            if (actor.type === "user") {
                const newUser = _.assign({}, actor);
                newUser.satiation = 1;
                newUser.inventory = _.assign({}, newUser.inventory, {
                    itemIds: _.without(newUser.inventory.itemIds, action.itemId)
                });
                dispatch(entityUpdate(newUser));
            }
        }
    };
}

function handleUseItemTargettedAction(state: IState, actor: Entity.Actor, action: ModelActions.IUseItemTargettedAction) {
    const item = state.entities[action.itemId] as Entity.Item;

    return (dispatch: Redux.Dispatch<IState>, getState: () => IState) => {
        if (item.type === "axe") {
            const target = state.entities[action.targetId];
            if (target.type !== "tree") {
                throw new Error(`Axe cannot be used on ${target.type}!`);
            }
            dispatch(entityDelete(target.id));
        }
    };
}

function handleMoveAction(state: IState, actorId: string, action: ModelActions.IMoveAction) {
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

    return (dispatch: Redux.Dispatch<IState>, getState: () => IState) => {
        const level = findEntityLevel(actorId, state);
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
            // can't move there; do nothing and abort action.
            return;
        } else {
            const newActor = Entity.move(actor, direction);
            dispatch(entityUpdate(newActor));

            // update user vision if necessary
            if (actorId === "0") {
                const newMap = level.map.cloneShallow();
                newMap.removeVision(actor.position, 7);
                newMap.giveVision(newActor.position, 7);
                const newLevel = new Level(level.id, newMap, level.entities);
                dispatch(updateLevel(newLevel));
            }
        }
    };
}

function handleGoDownstairsAction(state: IState, actor: Entity.Actor, actorAtion: ModelActions.IGoDownstairsAction) {
    return (dispatch: Redux.Dispatch<IState>, getState: () => IState) => {
        const actorLevel = findEntityLevel(actor.id, state);
        const currentTile = actorLevel.map.get(actor.position.x, actor.position.y);
        if (currentTile.type === TileType.DOWNSTAIRS) {
            const levelIndex = state.levelOrder.indexOf(actorLevel.id);
            // go downstairs by doing a change level action
            dispatch(entityChangeLevel(actor.id, levelIndex + 1));
        }
    };
}

function handleGoUpstairsAction(state: IState, actor: Entity.Actor, actorAtion: ModelActions.IGoUpstairsAction) {
    return (dispatch: Redux.Dispatch<IState>, getState: () => IState) => {
        const actorLevel = findEntityLevel(actor.id, state);
        const currentTile = actorLevel.map.get(actor.position.x, actor.position.y);
        if (currentTile.type === TileType.UPSTAIRS) {
            const levelIndex = state.levelOrder.indexOf(actorLevel.id);
            // go upstairs by doing a change level action
            dispatch(entityChangeLevel(actor.id, levelIndex - 1));
        }
    };
}

function handlePickUpItemAction(state: IState, actor: Entity.Actor, actorAction: ModelActions.IPickUpItemAction) {
    const actorLevel = findEntityLevel(actor.id, state);
    const item = state.entities[actorAction.itemId];
    const itemLevel = findEntityLevel(item.id, state);
    if (!Entity.isItem(item)) {
        throw new Error(`tried pick-up-item on a non-item entity ${JSON.stringify(item)}`);
    }
    return (dispatch: Redux.Dispatch<IState>, getState: () => IState) => {
        if (_.isEqual(item.position, actor.position) && itemLevel === actorLevel && Entity.hasInventory(actor)) {
            // TODO associate actions with Entity traits

            const newLevel = new Level(itemLevel.id, itemLevel.map, _.without(itemLevel.entities, item.id));
            const newEntity = _.assign({}, actor, {
                inventory: _.assign({}, actor.inventory, {
                    itemIds: [...actor.inventory.itemIds, item.id],
                }),
            });

            dispatch(updateLevel(newLevel));
            dispatch(entityUpdate(newEntity));
        }
    };
}

function handleDropItemAction(state: IState, actor: Entity.Actor, actorAction: ModelActions.IDropItemAction) {
    const item = state.entities[actorAction.itemId];
    if (!Entity.isItem(item)) {
        throw new Error(`tried drop-item on a non-item ${JSON.stringify(item)}`);
    }
    if (!Entity.hasInventory(actor)) {
        throw new Error(`Actor of type ${actor.type} tried to drop-item, but has no inventory!`);
    }

    return (dispatch: Redux.Dispatch<IState>, getState: () => IState) => {
        const level = findEntityLevel(actor.id, state);
        const newLevel = new Level(level.id, level.map, [...level.entities, item.id]);
        const newActor: Entity.Actor = _.assign({}, actor, {
            inventory: _.assign({}, actor.inventory, {
                itemIds: _.without(actor.inventory.itemIds, item.id),
            }),
        });
        // set new item on user's position
        const newItem = _.assign({}, item, {
            position: _.assign({}, actor.position),
        });
        dispatch(updateLevel(newLevel));
        dispatch(entityUpdate(newActor));
        dispatch(entityUpdate(newItem));
    };
}

function handleCreateFruitAction(state: IState, actor: Entity.Actor, actorAction: ModelActions.ICreateFruitAction) {
    return (dispatch: Redux.Dispatch<IState>, getState: () => IState) => {
        const fruit: Entity.IFruit = {
            id: Math.random().toString(16).substring(2),
            position: {
                x: actor.position.x + (Math.random() < 0.5 ? -1 : 1),
                y: actor.position.y + (Math.random() < 0.5 ? -1 : 1),
            },
            type: "fruit",
        };
        dispatch(entityUpdate(fruit));

        const level = findEntityLevel(actor.id, state);
        const newLevel = new Level(level.id, level.map, [...level.entities, fruit.id]);
        dispatch(updateLevel(newLevel));
    };
}
