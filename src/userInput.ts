import * as _ from "lodash";

import { findEntityLevel, canActorTakeMoveAction, MOVE_ACTION_OFFSETS } from "action";
import * as Entity from "model/entity";
import { IState } from "state";
import {
    Action,
    IUseItemTargettedAction,
    IMoveAction,
    IGoUpstairsAction,
    IGoDownstairsAction,
    IDoNothingAction,
    IPickUpItemAction,
    IDropItemAction
} from "./model/action";

/**
 * Defines which keyboard keys (that come from KeyboardEvent.code) map to action types.
 */
interface IUserActionKeyMapping {
    // [key: string]: ModelAction.Action;
    KeyW?: IMoveAction | IUseItemTargettedAction;
    KeyA?: IMoveAction | IUseItemTargettedAction;
    KeyS?: IMoveAction | IUseItemTargettedAction;
    KeyD?: IMoveAction | IUseItemTargettedAction;
    KeyQ?: IGoUpstairsAction;
    KeyE?: IGoDownstairsAction;
    KeyG?: IPickUpItemAction;
    KeyP?: IDropItemAction;
    Period?: IDoNothingAction;
}

const DIRECTIONAL_MOVE_ACTIONS: IUserActionKeyMapping = {
    KeyW: {
        direction: "up",
        type: "move",
    },
    KeyA: {
        direction: "left",
        type: "move",
    },
    KeyS: {
        direction: "down",
        type: "move",
    },
    KeyD: {
        direction: "right",
        type: "move",
    }
};

export function decideUserAction(state: IState, event: KeyboardEvent): Action | undefined {
    const availableActions: IUserActionKeyMapping = {
        KeyQ: {
            type: "go-upstairs",
        },
        KeyE: {
            type: "go-downstairs",
        },
        Period: {
            type: "nothing",
        },
    };

    _.each(DIRECTIONAL_MOVE_ACTIONS, (action, key: keyof typeof DIRECTIONAL_MOVE_ACTIONS) => {
        if (key === undefined) {
            throw new Error("key should never be undefined");
        }
        if (canActorTakeMoveAction(state, "0", action)) {
            availableActions[key] = action;
        } else {
            const user = state.entities[0];
            const axeItem: Entity.IAxe = _.find(
                user.inventory.itemIds.map((id) => state.entities[id]),
                (entity) => entity.type === "axe"
            ) as Entity.IAxe;

            if (axeItem !== undefined) {
                const direction = MOVE_ACTION_OFFSETS[action.direction];
                const newPosition = {
                    x: user.position.x + direction.x,
                    y: user.position.y + direction.y,
                };
                const entitiesInTheWay = Entity.getEntitiesAtPosition(state, findEntityLevel("0", state).id, newPosition);
                // if there's a tree in the way, cut it down
                const treesInTheWay = entitiesInTheWay.filter((entityId) => state.entities[entityId].type === "tree");
                const mercuriesInTheWay = entitiesInTheWay.filter((entityId) => state.entities[entityId].type === "mercury");

                if (treesInTheWay.length > 0) {
                    // there is a tree here - allow user to cut it down
                    const cutTreeAction: IUseItemTargettedAction = {
                        itemId: axeItem.id,
                        targetId: state.entities[treesInTheWay[0]].id,
                        type: "use-item-target"
                    };
                    availableActions[key] = cutTreeAction;
                } else if (mercuriesInTheWay.length > 0) {
                    const mercuryAttackAction: IUseItemTargettedAction = {
                        itemId: axeItem.id,
                        targetId: state.entities[mercuriesInTheWay[0]].id,
                        type: "use-item-target"
                    };
                    availableActions[key] = mercuryAttackAction;
                }
            }
        }
    });

    const user = state.entities["0"];
    // add pick-up-item if available
    const itemsBeneathUser = Entity.getEntitiesAtPosition(
        state,
        findEntityLevel("0", state).id,
        user.position
    ).filter((entityId) => {
        return Entity.isItem(state.entities[entityId]);
    });
    if (itemsBeneathUser.length > 0) {
        availableActions.KeyG = {
            itemId: itemsBeneathUser[0],
            type: "pick-up-item",
        };
    }

    if (user.inventory.itemIds.length > 0) {
        availableActions.KeyP = {
            itemId: user.inventory.itemIds[0],
            type: "drop-item",
        };
    }

    if (availableActions[event.code]) {
        return availableActions[event.code];
    } else {
        return undefined;
    }
};
