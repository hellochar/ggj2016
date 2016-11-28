import * as _ from "lodash";

import { forEachOnLineInGrid, forEachInRect, forEachInCircle, IPosition } from "math";
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

    public cloneShallow(): Map {
        return new Map(this.tiles.map((row) => row.slice()), this.colorTheme);
    }

    get width() {
        return this.tiles[0].length;
    }

    get height() {
        return this.tiles.length;
    }

    public get(x: number, y: number, then?: (t: ITile) => void): ITile | void {
        const row = this.tiles[y];
        if (row != null) {
            const tile = row[x];
            if (tile != null && then != null) {
                then(tile);
            }
            return tile;
        } else {
            if (then === undefined) {
                throw new Error(`Cannot get ${x},${y}`);
            }
        }
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

    public isTileFree(p: IPosition) {
        const tile = this.get(p.x, p.y);
        if (tile) {
            return tile.type === TileType.SPACE;
        } else {
            return true;
        }
    }

    // inline mutation
    public outlineRectWithWalls(topLeft: IPosition = {x: 0, y: 0},
                                bottomRight: IPosition = {x: this.width - 1, y: this.height - 1}) {
        const setToWall = (p: IPosition) => {
            const { explored, visible } = this.tiles[p.y][p.x];
            this.tiles[p.y][p.x] = {
                type: TileType.WALL,
                explored,
                visible,
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
                this.tiles[y][x].type = TileType.SPACE;
            });
        }
    }

    /**
     * Lose vision of the given circle.
     * 
     * Assigns new objects to the this.tiles that changed.
     */
    public removeVision(center: IPosition, radius: number) {
        forEachInCircle(center, radius, ({x, y}) => {
            this.get(x, y, (tile) => {
                this.tiles[y][x] = _.assign({}, tile, { visible: false });
            });
        });
    }

    public illuminated() {
        const map = this.clone();
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                map.tiles[y][x].explored = true;
                map.tiles[y][x].visible = true;
            }
        }
        return map;
    }

    /**
     * Give vision in the given circle.
     * 
     * Assigns new objects to the this.tiles that have changed.
     */
    public giveVision(center: IPosition, radius: number) {
        forEachInCircle(center, radius, ({x, y}) => {
            this.get(x, y, (oldTile) => {
                const tile = _.assign({}, oldTile);
                if (!tile.visible) {
                    let isVisionBlocked = false;
                    forEachOnLineInGrid({x, y}, center, (position) => {
                        if (this.tiles[position.y][position.x].type === TileType.WALL) {
                            isVisionBlocked = true;
                            return true;
                        } else {
                            return false;
                        }
                    });
                    tile.visible = !isVisionBlocked;
                    if (tile.visible) {
                        tile.explored = true;
                    }
                    this.tiles[y][x] = tile;
                }
            });
        });
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
