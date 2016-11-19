import { findEntityLevel } from "action";
import * as Entity from "model/entity";
import * as ModelAction from "model/action";
import { IState } from "state";

export function decideUserAction(state: IState, event: KeyboardEvent): ModelAction.Action | undefined {
    const mapping: { [key: string]: ModelAction.Action } = {
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
        },
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
        mapping["KeyG"] = {
            itemId: itemsBeneathUser[0],
            type: "pick-up-item",
        };
    }

    if (user.inventory.itemIds.length > 0) {
        mapping["KeyP"] = {
            itemId: user.inventory.itemIds[0],
            type: "drop-item",
        };
    }

    if (mapping[event.code]) {
        return mapping[event.code];
    } else {
        return undefined;
    }
};
