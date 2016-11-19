import * as _ from "lodash";
import * as Redux from "redux";

import { findEntityLevel, setScreen, updateLevel } from "action";
import { Level } from "model/level";
import { IState } from "state";

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

export function handleChangeLevelAction(_unused: IState, action: IChangeLevelAction) {
    return (dispatch: Redux.Dispatch<IState>, getState: () => IState) => {
        const userHasRing = _.some(getState().entities[0].inventory.itemIds, (itemId) => {
            return getState().entities[itemId].type === "ring";
        });
        // user has gotten out!
        if (action.newLevel === -1 && userHasRing) {
            dispatch(setScreen("user-won"));
            return;
        }
        const newLevelId = getState().levelOrder[action.newLevel];
        if (newLevelId !== undefined) {
            const entity = getState().entities[action.entityId];
            const level = findEntityLevel(action.entityId, getState());

            // delete entity from old level
            dispatch(updateLevel(new Level(level.id, level.map, _.without(level.entities, action.entityId))));

            // add entity to new level and give vision
            const newMap = getState().levels[newLevelId].map.clone();
            newMap.giveVision(entity.position, 7);
            const newLevel = new Level(newLevelId, newMap, [entity.id, ...getState().levels[newLevelId].entities]);
            dispatch(updateLevel(newLevel));
        }
    };
}
