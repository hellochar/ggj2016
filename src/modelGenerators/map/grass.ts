import { Map } from "model/map";
import { allTiles, floodFill } from "./commons";
import { TileType } from "model/tile";

/**
 * Ideas for grass:
 * 
 * Find junction of water and space and fill grass.
 * Find corners of rock and fill with grass.
 * Slight growth of grass from existing grass, maybe randomly
 */

export function addGrass(map: Map) {
    const seedGrassTiles = allTiles(map)
        .filter((p) => map.get(p.x, p.y).type === TileType.DIRT)
        .filter((p) => map.getMooreNeighborhood(p).filter(
            (pAdjacent) => map.get(pAdjacent.x, pAdjacent.y).type === TileType.WALL
            ).length >= 5);
        // .filter((p) => map.getMooreNeighborhood(p).filter(
        //     (pAdjacent) => map.get(pAdjacent.x, pAdjacent.y).type === TileType.WATER
        //     ).length >= 3);

    seedGrassTiles.forEach((seed) => {
        // grow the seed by 3 squares each
        floodFill(map, seed, (p) => map.get(p.x, p.y).type === TileType.DIRT).limit(9).forEach((p) => {
            map.set(p, {
                type: "GRASS"
            });
        });
        // map.set(seed, {
        //     type: "GRASS"
        // });
    });
}