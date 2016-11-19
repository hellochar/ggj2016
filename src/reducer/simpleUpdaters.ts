import * as _ from "lodash";

import { SimpleUpdaterAction as SimpleAction } from "action/simpleUpdaters";
import { IEntities, ILevels, IState, Screen } from "state";

function simpleEntitiesReducer(entities: IEntities, action: SimpleAction): IEntities {
    if (action.type === "EntityUpdate") {
        return _.assign({}, entities, {
            [action.entity.id]: action.entity,
        });
    } else if (action.type === "EntityDelete") {
        const newEntities = _.assign({}, entities);
        delete newEntities[action.entityId];
        return newEntities;
    } else {
        return entities;
    }
}

function simpleLevelOrderReducer(levelOrder: string[], action: SimpleAction): string[] {
    return levelOrder;
}

function simpleLevelsReducer(levels: ILevels, action: SimpleAction): ILevels {
    if (action.type === "UpdateLevel") {
        return _.assign({}, levels, {
            [action.level.id]: action.level,
        });
    } else {
        return levels;
    }
}

function simpleScreenReducer(screen: Screen, action: SimpleAction): Screen {
    if (action.type === "SetScreen") {
        return action.screen;
    } else {
        return screen;
    }
}

function simpleTurnOrderReducer(turnOrder: string[], action: SimpleAction): string[] {
    if (action.type === "RotateTurnOrder") {
        return [...turnOrder.splice(1), turnOrder[0]];
    } else {
        return turnOrder;
    }
}

export default function simpleReducer(state: IState, action: SimpleAction): IState {
    return {
        entities: simpleEntitiesReducer(state.entities, action),
        levelOrder: simpleLevelOrderReducer(state.levelOrder, action),
        levels: simpleLevelsReducer(state.levels, action),
        screen: simpleScreenReducer(state.screen, action),
        turnOrder: simpleTurnOrderReducer(state.turnOrder, action),
    };
}