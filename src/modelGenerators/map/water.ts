import { Map } from "model/map";
import { randomMapPoints, floodFill } from "./commons";

/**
 * Ideas for water:
 * 
 * Pick a random empty spot, flood fill (breadth first) for a while
 * Carve a pathway straight through the cave
 * Carve a big hole and fill it with water
 */

export function addWater(map: Map) {
    const emptyPosition = randomMapPoints(map).filter(( {x, y} ) => map.tiles[y][x].type === "SPACE").findFirst().get();
    const emptyNearbyTiles = floodFill(map, emptyPosition, (p) => map.get(p.x, p.y).type === "SPACE");

    emptyNearbyTiles.limit(300).forEach((p) => {
        map.set(p, {
            type: "WATER"
        });
    });
}