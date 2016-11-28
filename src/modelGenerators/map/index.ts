/**
 * Holds methods for generating Level objects. The primary responsibility is new creation of Levels from input
 * parameters such as random seed, or descriptive quantities e.g. difficulty/cave-like-ness/etc.
 */

import { Map } from "model/map";
import { TileType } from "model/tile";
import { IPosition } from "math";
import { generateCaveStructure } from "./cave";

/**
 * Generate a random cave-like Map with space, walls, and an upstairs and downstairs that will connect.
 * The outer edge will be filled with walls.
 */
export function generateMap(upstairs: IPosition, colorTheme: string[]): Map {
    const width = 60;
    const height = 30;
    let map = generateCaveStructure(width, height, colorTheme);

    // inset relevant features such as downstairs and path endpoints by this much into the map.
    const inset = 3;
    function randomX() {
        return inset + Math.floor(Math.random() * (width - inset * 2));
    }

    function randomY() {
        return inset + Math.floor(Math.random() * (height - inset * 2));
    }

    // generate the downstairs tile
    let downstairs: IPosition;
    do {
        downstairs = {
            x: randomX(),
            y: randomY(),
        };
    } while (Math.abs(downstairs.x - upstairs.x) < 2 && Math.abs(downstairs.y - upstairs.y) < 2);
    map.setImportantTile(downstairs, TileType.DOWNSTAIRS);
    // generate a random path from upstairs to downstairs
    const lineSegments = [ upstairs ];
    for (let k = 0 ; k < 3 || Math.random() < 0.8 && k % 2 === 0; k++) {
        const { x: oldX, y: oldY } = lineSegments[lineSegments.length - 1];
        let x = oldX;
        let y = oldY;
        // change either the x or y dimension
        if (k % 2 === 0) {
            while (Math.abs(x - oldX) < 2) {
                x = randomX();
            }
        } else {
            while (Math.abs(y - oldY) < 2) {
                y = randomY();
            }
        }
        lineSegments.push({x, y});
    }
    // connect smoothly to the downstairs
    lineSegments.push({
        x: lineSegments[lineSegments.length - 1].x,
        y: downstairs.y
    });
    lineSegments.push(downstairs);
    map.drawPathBetween(lineSegments);
    map.setImportantTile(downstairs, TileType.DOWNSTAIRS);
    map.setImportantTile(upstairs, TileType.UPSTAIRS);

    map.outlineRectWithWalls();
    return map;
}