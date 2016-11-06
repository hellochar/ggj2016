import { IAction, handlePerformActionAction, handleChangeLevelAction, handleIterateUntilActorTurnAction } from "./action";
import * as Entity from "./model/entity";
import { Level, generateMap } from "./model/level";
import { IState } from "./state";

function buildInitialState(): IState {
    const entitiesToAdd: Entity.Entity[] = [];

    const center = {x: 30, y: 15};

    const user: Entity.IUser = {
        id: "0",
        type: "user",
        name: "hellochar",
        position: center,
        health: 10,
        maxHealth: 10,
        inventory: {
            itemIds: [],
            maxSize: 20
        },
        satiation: 1,
    };
    entitiesToAdd.push(user);
    const level0 = new Level("0", generateMap(center), [ user.id ]);
    entitiesToAdd.push(...level0.addTrees());
    entitiesToAdd.push(...level0.addVillage());
    level0.map.giveVision(center, 7);
    const levels = {
        0: level0,
    };
    const levelOrder = ["0"];
    for (let depth = 1; depth < 10; depth += 1) {
        const id = depth.toString();
        const newMap = generateMap(levels[depth - 1].map.getDownstairsPosition());
        const currentLevel = new Level(id, newMap, []);
        entitiesToAdd.push(...currentLevel.addTrees());
        entitiesToAdd.push(...currentLevel.addVillage());
        levels[id] = currentLevel;
        levelOrder.push(id);
    }

    const lastLevel = levels[levelOrder[levelOrder.length - 1]];
    entitiesToAdd.push(lastLevel.placeRing());

    const turnOrder = entitiesToAdd.filter(Entity.isActor).map((actor) => actor.id);

    return {
        entities: _.assign(_.keyBy(entitiesToAdd, "id"), {
            "0": user
        }),
        levelOrder,
        levels,
        turnOrder: turnOrder,
    };
}
const INITIAL_STATE: IState = buildInitialState();

/**
 * Top-level reducer for the game.
 */
export default function reducer(state: IState = INITIAL_STATE, action: IAction): IState {
    if (action.type === "PerformAction") {
        const nextState = handlePerformActionAction(state, action);
        // TODO don't make this happen here
        // nextState !== state is to ensure the action was valid and to move time forward
        if (nextState !== state && action.actorId === "0") {
            // move user to the end of the turn order
            nextState.turnOrder = [...nextState.turnOrder.splice(1), nextState.turnOrder[0]];
            return handleIterateUntilActorTurnAction(nextState, {
                actorId: "0",
                type: "IterateUntilActorTurn",
            });
        } else {
            return nextState;
        }
    } else if (action.type === "ChangeLevel") {
        return handleChangeLevelAction(state, action);
    } else if (action.type === "IterateUntilActorTurn") {
        return handleIterateUntilActorTurnAction(state, action);
    } else {
        return state;
    }
}
