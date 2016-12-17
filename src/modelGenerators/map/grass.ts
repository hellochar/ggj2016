import { Map } from "model/map";
import { TileType } from "model/tile";

/**
 * Ideas for grass:
 * 
 * Find junction of water and space and fill grass.
 * Find corners of rock and fill with grass.
 * Slight growth of grass from existing grass, maybe randomly
 */

export function addGrass(map: Map) {
    const seedGrassTiles = map.allTiles()
        // find dirt tiles
        .filter((p) => map.get(p).type === TileType.DIRT)
        // that are touching multiple rocks
        .filter((p) => map.getMooreNeighborhood(p).filter(
            (pAdjacent) => map.get(pAdjacent).type === TileType.WALL
            ).length >= 5);
        // .filter((p) => map.getMooreNeighborhood(p).filter(
        //     (pAdjacent) => map.get(pAdjacent.x, pAdjacent.y).type === TileType.WATER
        //     ).length >= 3);

    seedGrassTiles.forEach((seed) => {
        map.floodFill(seed, (p) => map.get(p).type === TileType.DIRT).limit(5).forEach((p) => {
            map.set(p, {
                type: "GRASS"
            });
        });
        // map.set(seed, {
        //     type: "GRASS"
        // });
    });
}