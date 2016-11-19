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
export function entityChangeLevel(entityId: string, newLevel: number) {
    return (dispatch: Redux.Dispatch<IState>, getState: () => IState) => {
        const userHasRing = _.some(getState().entities[0].inventory.itemIds, (itemId) => {
            return getState().entities[itemId].type === "ring";
        });
        // user has gotten out!
        if (newLevel === -1 && userHasRing) {
            dispatch(setScreen("user-won"));
            return;
        }
        const newLevelId = getState().levelOrder[newLevel];
        if (newLevelId !== undefined) {
            const entity = getState().entities[entityId];
            const level = findEntityLevel(entityId, getState());

            // add entity to new level and give vision
            const newMap = getState().levels[newLevelId].map.clone();
            newMap.giveVision(entity.position, 7);
            const newLevel = new Level(newLevelId, newMap, [entity.id, ...getState().levels[newLevelId].entities]);
            dispatch(updateLevel(newLevel));

            // delete entity from old level
            dispatch(updateLevel(new Level(level.id, level.map, _.without(level.entities, entityId))));

        }
    };
}
