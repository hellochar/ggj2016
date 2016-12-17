import * as _ from "lodash";

import { forEachOnLineInGrid, forEachInRect, IPosition } from "math";
import { ITile, TileType } from "model/";

/**
 * A 2D grid of tiles. Map's update model is to mutate in-place but also has a copy method,
 * so you usually want to copy the old state and then mutate to your heart's content before passing
 * it back to Redux.
 */
export class Map {
    constructor(public tiles: ITile[][], public colorTheme: string[]) {}

    public clone(): Map {
        return new Map(_.cloneDeep(this.tiles), this.colorTheme);
    }

    get width() {
        return this.tiles[0].length;
    }

    get height() {
        return this.tiles.length;
    }

    /**
     * Return the tile at the given position, or undefined. If passed a callback, get() will invoke the callback when 
     * the tile exists.
     */
    public get(x: number, y: number, then?: (t: ITile) => void): ITile | void {
        const row = this.tiles[y];
        if (row != null) {
            const tile = row[x];
            if (tile != null && then != null) {
                then(tile);
            }
            return tile;
        }
        return undefined;
    }

    /**
     * Mutates.
     */
    public set(p: IPosition, tile: ITile) {
        this.tiles[p.y][p.x] = tile;
    }

    public isInBounds(position: IPosition) {
        return this.get(position.x, position.y) !== undefined;
    }

    /**
     * Returns the in-bounds von Neumann neighborhood (adjacent not including diagonals) positions for the given input position.
     */
    public getVonNeumannNeighborhood(center: IPosition) {
        return [
            { x: center.x - 1, y: center.y },
            { x: center.x + 1, y: center.y },
            { x: center.x, y: center.y - 1 },
            { x: center.x, y: center.y + 1 },
        ].filter((position) => this.isInBounds(position));
    }

    /**
     * Returns the in-bounds Moore neighborhood (adjacent including diagonals) positions for the given input position.
     */
    public getMooreNeighborhood(center: IPosition) {
        return [
            { x: center.x - 1, y: center.y - 1 },
            { x: center.x, y: center.y - 1 },
            { x: center.x + 1, y: center.y - 1 },
            { x: center.x - 1, y: center.y },
            // { x: center.x, y: center.y },
            { x: center.x + 1, y: center.y },
            { x: center.x - 1, y: center.y + 1 },
            { x: center.x, y: center.y + 1 },
            { x: center.x + 1, y: center.y + 1 },
        ].filter((position) => this.isInBounds(position));
    }

    public getTiles() {
        return this.tiles;
    }

    public isTileObstructed(p: IPosition) {
        const tile = this.get(p.x, p.y);
        if (tile) {
            return tile.type === TileType.WALL;
        } else {
            return true;
        }
    }

    // inline mutation
    public outlineRectWithWalls(topLeft: IPosition = {x: 0, y: 0},
                                bottomRight: IPosition = {x: this.width - 1, y: this.height - 1}) {
        const setToWall = (p: IPosition) => {
            this.tiles[p.y][p.x] = {
                type: TileType.WALL,
                color: this.colorTheme[0],
            };
            return false;
        };
        forEachOnLineInGrid(topLeft, {x: topLeft.x, y: bottomRight.y}, setToWall);
        forEachOnLineInGrid({x: topLeft.x, y: bottomRight.y}, bottomRight, setToWall);
        forEachOnLineInGrid(bottomRight, {x: bottomRight.x, y: topLeft.y}, setToWall);
        forEachOnLineInGrid({x: bottomRight.x, y: topLeft.y}, topLeft, setToWall);
    }

    public drawPathBetween(lineSegments: IPosition[]) {
        for ( let k = 0; k < lineSegments.length - 1; k++ ) {
            const from = lineSegments[k];
            const to = lineSegments[k + 1];
            forEachOnLineInGrid(from, to, ({x, y}) => {
                this.tiles[y][x].type = TileType.PAVED_FLOOR;
            });
        }
    }

    public getDownstairsPosition(): IPosition | null {
        for (let y = 0; y < this.height; y += 1) {
            for (let x = 0; x < this.width; x += 1) {
                if (this.tiles[y][x].type === TileType.DOWNSTAIRS) {
                    return {x, y};
                }
            }
        }
        return null;
    }

    public setImportantTile(p: IPosition, type: TileType) {
        forEachInRect({x: p.x - 1, y: p.y - 1},
                      {x: p.x + 1, y: p.y + 1},
                      (p) => this.tiles[p.y][p.x].type = TileType.DECORATIVE_SPACE);
        const tile = this.tiles[p.y][p.x];
        tile.type = type;
    }
}
