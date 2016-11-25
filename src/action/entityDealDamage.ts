import * as _ from "lodash";
import * as Redux from "redux";

import {
    entityDelete,
    entityUpdate,
} from "action";
import * as Entity from "model/entity";
import { IState } from "state";

export function entityDealDamage(target: Entity.Entity & Entity.IHasHealth, damage: number) {
    return (dispatch: Redux.Dispatch<IState>, getState: () => IState) => {
        const newEntity = _.assign({}, target, {
            health: target.health - damage,
        });
        if (newEntity.health > 0) {
            dispatch(entityUpdate(newEntity));
        } else {
            // kill entity - remove it from the game
            dispatch(entityDelete(target.id));
        }
    };
}
