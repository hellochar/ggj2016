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
export function entityChangeLevel(entityId: string, newLevelIndex: number) {
    return (dispatch: Redux.Dispatch<IState>, getState: () => IState) => {
        const userHasRing = _.some(getState().entities[0].inventory.itemIds, (itemId) => {
            return getState().entities[itemId].type === "ring";
        });
        // user has gotten out!
        if (newLevelIndex === -1 && userHasRing) {
            dispatch(setScreen("user-won"));
            return;
        }
        const newLevelId = getState().levelOrder[newLevelIndex];
        if (newLevelId !== undefined) {
            const entity = getState().entities[entityId];
            const oldLevel = findEntityLevel(entityId, getState());
            let newLevel = getState().levels[newLevelId];

            // add entity to new level and give vision
            newLevel = newLevel.cloneShallowVisibility();
            newLevel.giveVision(entity.position, 7);
            newLevel = new Level(newLevel.id, newLevel.map, [entity.id, ...newLevel.entities], newLevel.visibility);
            dispatch(updateLevel(newLevel));

            // delete entity from old level
            dispatch(updateLevel(oldLevel.withoutEntity(entityId)));

        }
    };
}
