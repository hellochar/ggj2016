import * as _ from "lodash";
import * as Stream from "streamjs";

import { IPosition } from "math";
import { Map } from "model/map";

export function randomMapPoints(map: Map): Stream<IPosition> {
    return Stream.generate(() => ({
        x: _.random(0, map.width - 1),
        y: _.random(0, map.height - 1),
    }));
}

export function floodFill(map: Map, start: IPosition, shouldAdd: (p: IPosition) => boolean): Stream<IPosition> {
    const visited: { [key: string]: true } = {};
    const queue = [start];
    return Stream.generate(() => {
        const next = queue.shift();
        if (next !== undefined) {
            map
                .getVonNeumannNeighborhood(next)
                .filter((p) => visited[`${p.x},${p.y}`] === undefined && shouldAdd(p))
                .forEach((position) => {
                    visited[`${position.x},${position.y}`] = true;
                    queue.push(position);
                });
        }
        return next;
    }).takeWhile((isEnd) => isEnd !== undefined) as Stream<IPosition>;
}

export function allTiles(map: Map): Stream<IPosition> {
    return Stream.iterate({x: 0, y: 0}, ({x, y}) => {
        return {
            x: x < map.width - 1 ? x + 1 : 0,
            y: x < map.width - 1 ? y : y + 1
        };
    }).takeWhile( ({y}) => y < map.height );
}
