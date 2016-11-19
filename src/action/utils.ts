import * as _ from "lodash";

// import * as Entity from "model/entity";
import { Level } from "model/level";
import { IState } from "state";

/**
 * Convenience function to get the level of an entity.
 *
 * In a perfect world this would be a "computed" property of an Entity, or an enriched method on the Entity.
 */
export function findEntityLevel(entityId: string, state: IState) {
    return _.find(state.levels, (level: Level) => {
        return level.entities.some((id) => entityId === id);
    });
}

/**
 * Convenience function to mutate the entity given by the entityId as well as the level it lives on. Useful for implementing reducers.
 */
// export function updateEntityLevel(
//     state: IState,
//     entityId: string,
//     update: (level: Level) => { level?: Level, entity?: Entity.Entity }): IState {
//     const userLevel = findEntityLevel(entityId, state.levels);
//     const { level, entity } = update(userLevel);

//     const newState = _.assign({}, state);
//     let changed = false;

//     if (level != null && level !== userLevel) {
//         changed = true;
//         newState.levels = _.assign({}, state.levels, {
//             [userLevel.id]: level
//         });
//     }

//     if (entity != null) {
//         changed = true;
//         newState.entities = _.assign({}, state.entities, {
//             [entity.id]: entity,
//         });
//     }

//     if (changed) {
//         return newState;
//     } else {
//         return state;
//     }
// }
