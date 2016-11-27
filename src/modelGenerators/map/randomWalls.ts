import { ITile, TileType, IWallTile } from "model/tile";
import { Map } from "model/level";

/**
 * Generate a map with each tile randomly chosen to be a wall with the given percentage, or a space otherwise.
 */
export function generateRandomWalls(width: number, height: number, percentage: number, colorTheme: string[]): Map {
    const map: ITile[][] = [];
    for (let y = 0; y < height; y += 1) {
        const row: ITile[] = [];
        for (let x = 0; x < width; x += 1) {
            if (Math.random() < percentage) {
                row.push({
                    explored: false,
                    visible: false,
                    type: TileType.WALL,
                    color: colorTheme[colorTheme.length - 1],
                } as IWallTile);
            } else {
                row.push({
                    explored: false,
                    visible: false,
                    type: TileType.SPACE,
                });
            }
        }
        map.push(row);
    }
    return new Map(map, colorTheme);
}
