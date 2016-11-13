import * as Entity from "model/entity";
import { Level, generateMap } from "model/level";
import { IState } from "state";

export function buildInitialState(): IState {
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
    entitiesToAdd.push(...level0.addTrees());
    entitiesToAdd.push(...level0.addTrees());
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
        userDead: false,
    };
}
