/* tslint:disable */

import { IAction, findEntityLevel, handlePerformActionAction, handleChangeLevelAction, handleIterateUntilActorTurnAction } from "./action";
import * as Entity from "./model/entity";
import { Level, Tile, TileType, generateMap } from "./model/level";
import { IState } from "./state";

function buildInitialState(): IState {
    const center = {x: 30, y: 15};
    const user = new Entity.User("0", center);
    const mercury = new Entity.Mercury("1", {x: 2, y: 2});
    const level0 = new Level("0", generateMap(center),
        [
            user.id,
            mercury.id
        ]
    );
    // level0.addLeaves();
    level0.map.giveVision(center, 7);
    const levels = {
        0: level0,
    }
    const levelOrder = ["0"];
    for(let depth = 1; depth < 5; depth += 1) {
        const id = depth.toString();
        const newMap = generateMap(levels[depth - 1].map.getDownstairsPosition());
        const currentLevel = new Level(id, newMap, []);
        // currentLevel.addLeaves();
        levels[id] = currentLevel;
        levelOrder.push(id);
    }
    // const lastLevel = levels[levels.length - 1];
    // const ringPosition = lastLevel.map.getDownstairsPosition();
    // lastLevel.map.setImportantTile(ringPosition, TileType.DECORATIVE_SPACE);
    // const ringEntity = new Entity.Ring(ringPosition);
    // lastLevel.entities.push(ringEntity);

    return {
        entities: {
            [user.id]: user,
            [mercury.id]: mercury,
        },
        levelOrder,
        levels,
        turnOrder: [user.id, mercury.id],
    };
}
const INITIAL_STATE: IState = buildInitialState();

function error(t: never): never {
    throw new Error("bad case!");
}

/**
 * Top-level reducer for the game.
 */
export default function reducer(state: IState = INITIAL_STATE, action: IAction): IState {
    if (action.type === "PerformAction") {
        const nextState = handlePerformActionAction(state, action);
        // TODO don't make this happen here
        if (action.actorId === "0") {
            // skip to the next turn
            nextState.turnOrder = [...nextState.turnOrder.splice(1), nextState.turnOrder[0]];
            return handleIterateUntilActorTurnAction(nextState, {
                actorId: "0",
                type: "IterateUntilActorTurn",
            });
        } else {
            return nextState;
        }
    } else if(action.type === "ChangeLevel") {
        return handleChangeLevelAction(state, action);
    } else if(action.type === "IterateUntilActorTurn") {
        return handleIterateUntilActorTurnAction(state, action);
    } else {
        return state;
    }
}