/**
 * Map Mutators that set the entire space of tiles to some initial state.
 */

import { TileType } from "model/tile";
import { Map } from "model/map";
import * as _ from "lodash";

/**
 * Fill the given map with each tile randomly selected to be a wall with the given percentage, or a space otherwise.
 * Mutates the map.
 */
export const uniformPercentageSetWall = (percentage: number) => (map: Map) => {
    const { tiles, width, height, colorTheme } = map;
    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            if (Math.random() < percentage) {
                tiles[y][x] = {
                    type: TileType.WALL,
                    color: colorTheme[colorTheme.length - 1],
                };
            } else {
                tiles[y][x] = { type: TileType.SPACE };
            }
        }
    }
};

export const setInitialSeedWalls = (count: number) => (map: Map) => {
    const { tiles, width, height, colorTheme } = map;
    _.times(count, () => {
        tiles[_.random(1, height - 1)][_.random(1, width - 1)] = {
            type: TileType.WALL,
            color: colorTheme[colorTheme.length - 1]
        };
    });
};