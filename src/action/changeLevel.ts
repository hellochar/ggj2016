import * as _ from "lodash";

import { Level } from "model/level";
import { IState } from "state";
import { updateEntityLevel } from "./index";
import { handleSetScreen } from "./setScreen";

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
    const userHasRing = _.some(state.entities[0].inventory.itemIds, (itemId) => {
        return state.entities[itemId].type === "ring";
    });
    // user has gotten out!
    if (action.newLevel === -1 && userHasRing) {
        return handleSetScreen(state, { type: "SetScreen", screen: "user-won" });
    }
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
