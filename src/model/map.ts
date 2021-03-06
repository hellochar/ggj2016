import * as _ from "lodash";
import * as Stream from "streamjs";

import { rasterizedLine, forEachInRect, IPosition } from "math";
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
    public get(position: IPosition, then?: (t: ITile) => void): ITile | void {
        const row = this.tiles[position.y];
        if (row != null) {
            const tile = row[position.x];
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
        return this.get(position) !== undefined;
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

    public isTileObstructed(position: IPosition) {
        const tile = this.get(position);
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
            this.set(p, {
                type: TileType.WALL,
                color: this.colorTheme[0],
            });
        };
        rasterizedLine(topLeft, {x: topLeft.x, y: bottomRight.y}).forEach(setToWall);
        rasterizedLine({x: topLeft.x, y: bottomRight.y}, bottomRight).forEach(setToWall);
        rasterizedLine(bottomRight, {x: bottomRight.x, y: topLeft.y}).forEach(setToWall);
        rasterizedLine({x: bottomRight.x, y: topLeft.y}, topLeft).forEach(setToWall);
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

    public setImportantTile(p: IPosition, tile: ITile) {
        forEachInRect({x: p.x - 1, y: p.y - 1},
                      {x: p.x + 1, y: p.y + 1},
                      (p) => this.set(p, {
                          type: TileType.PAVED_FLOOR,
                          decorative: true
                        })
        );
        this.set(p, tile);
    }

    /**
     * Infinitely generate random points that are within ths bounds of this map.
     */
    public randomMapPoints(): Stream<IPosition> {
        return Stream.generate(() => ({
            x: _.random(0, this.width - 1),
            y: _.random(0, this.height - 1),
        }));
    }

    /**
     * Floodfill on this map from the start, adding positions if they pass the shouldAdd predicate.
     */
    public floodFill(start: IPosition, shouldAdd: (p: IPosition) => boolean): Stream<IPosition> {
        const visited: { [key: string]: true } = {};
        const queue = [start];
        return Stream.generate(() => {
            const next = queue.shift();
            if (next !== undefined) {
                this
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

    /**
     * Stream all the positions in this map one by one, from the top-left to the bottom-right, going left-right first.
     */
    public allTiles(): Stream<IPosition> {
        return Stream.iterate({x: 0, y: 0}, ({x, y}) => {
            return {
                x: x < this.width - 1 ? x + 1 : 0,
                y: x < this.width - 1 ? y : y + 1
            };
        }).takeWhile( ({y}) => y < this.height );
    }
}
