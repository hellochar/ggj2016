import * as _ from "lodash";
import * as Stream from "streamjs";

import { IPosition } from "math";
import { Map } from "model/map";

/**
 * Ideas for water:
 * 
 * Pick a random empty spot, flood fill (breadth first) for a while
 * Carve a pathway straight through the cave
 * Carve a big hole and fill it with water
 */

export function addWater(map: Map) {
    const emptyPosition = randomMapPoints(map).filter(( {x, y} ) => map.tiles[y][x].type === "SPACE" ).findFirst().get();
    const emptyNearbyTiles = floodFill(map, emptyPosition, (p) => map.get(p.x, p.y).type === "SPACE");

    emptyNearbyTiles.limit(125).forEach((p) => {
        map.set(p, {
            type: "WATER"
        });
    });
}

function randomMapPoints(map: Map): Stream<IPosition> {
    return Stream.generate(() => ({
        x: _.random(0, map.width - 1),
        y: _.random(0, map.height - 1),
    }));
}

function floodFill(map: Map, start: IPosition, shouldAdd: (p: IPosition) => boolean): Stream<IPosition> {
    const visited: { [key: string]: true } = {};
    const queue = [start];
    return Stream.generate(() => {
        const next = queue.shift();
        if (next !== undefined) {
            map
                .getNeighbors(next)
                .filter((p) => visited[`${p.x},${p.y}`] === undefined && shouldAdd(p))
                .forEach((position) => {
                    visited[`${position.x},${position.y}`] = true;
                    queue.push(position);
                });
        }
        return next;
    }).takeWhile((isEnd) => isEnd !== undefined) as Stream<IPosition>;
}