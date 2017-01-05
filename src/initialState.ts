import * as _ from "lodash";

import { COLOR_THEMES } from "colorThemes";
import * as Entity from "model/entity";
import { Level } from "model/level";
import { generateMap } from "modelGenerators/map";
import { IState } from "state";

export function buildInitialState(): IState {
    const entitiesToAdd: Entity.Entity[] = [];

    const center = {x: 30, y: 15};

    const fruit: Entity.IFruit = {
        type: "fruit",
        position: _.clone(center),
        id: Math.random().toString(16).substring(2),
    };
    const axe: Entity.IAxe = {
        type: "axe",
        position: _.clone(center),
        id: Math.random().toString(16).substring(2),
    };
    entitiesToAdd.push(fruit);
    entitiesToAdd.push(axe);

    const user: Entity.IUser = {
        id: "0",
        type: "user",
        name: "hellochar",
        position: center,
        health: 10,
        maxHealth: 10,
        inventory: {
            itemIds: [fruit.id, axe.id],
            maxSize: 20
        },
        satiation: 1,
        temperature: 20,
        energy: 1,
    };
    entitiesToAdd.push(user);
    const level0 = new Level("0", generateMap(center, COLOR_THEMES.DARK_GRAY), [ user.id ]);
    // entitiesToAdd.push(...level0.addTrees());
    // entitiesToAdd.push(...level0.addVillage());
    const newLevel0 = level0.cloneShallowVisibility();
    newLevel0.giveVision(center, 7);
    const levels = {
        0: newLevel0,
    };
    const levelOrder = ["0"];
    for (let depth = 1; depth < 10; depth += 1) {
        const id = depth.toString();
        const newMap = generateMap(levels[depth - 1].map.getDownstairsPosition(), _.sample(COLOR_THEMES));
        const currentLevel = new Level(id, newMap, []);
        // entitiesToAdd.push(...currentLevel.addVillage());
        // entitiesToAdd.push(...currentLevel.addTrees());
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
        screen: "play",
        globalTriggers: {
            seenIntro: false,
        }
    };
}
