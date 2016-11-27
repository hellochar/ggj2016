import { TileType } from "model/tile";
import { Map } from "model/level";

/**
 * Fill the given map with each tile randomly selected to be a wall with the given percentage, or a space otherwise.
 * Mutates the map.
 */
export const fillWithRandomWalls = (percentage: number) => (map: Map) => {
    const { tiles, width, height, colorTheme } = map;
    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const { explored, visible } = tiles[y][x];
            if (Math.random() < percentage) {
                tiles[y][x] = {
                    explored,
                    visible,
                    type: TileType.WALL,
                    color: colorTheme[colorTheme.length - 1],
                };
            } else {
                tiles[y][x] = {
                    explored,
                    visible,
                    type: TileType.SPACE,
                };
            }
        }
    }
};
