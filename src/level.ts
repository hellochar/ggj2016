/* tslint:disable */

import { forEachOnLineInGrid, Position } from "./math";
import { IEntity } from "./entity";
import { clone, repeat } from "./util";

export enum TileType {
    SPACE = 0,
    WALL = 1,
    DOWNSTAIRS = 2
}

export interface Tile {
    visible: boolean;
    type: TileType;
}

/**
 * A 2D grid of tiles. Map's update model is to mutate in-place but also has a copy method,
 * so you usually want to copy the old state and then mutate to your heart's content before passing
 * it back to Redux.
 */
export class Map {
    constructor(public tiles: Tile[][]) {}

    clone(): Map {
        return new Map(clone(this.tiles));
    }

    get width() {
        return this.tiles[0].length;
    }

    get height() {
        return this.tiles.length;
    }

    // inline mutation
    public outlineRectWithWalls(topLeft: Position = {x: 0, y: 0},
                                bottomRight: Position = {x: this.width - 1, y: this.height - 1}) {
        const setToWall = (p: Position) => {
            this.tiles[p.y][p.x].type = TileType.WALL;
            return false;
        }
        forEachOnLineInGrid(topLeft, {x: topLeft.x, y: bottomRight.y}, setToWall);
        forEachOnLineInGrid({x: topLeft.x, y: bottomRight.y}, bottomRight, setToWall);
        forEachOnLineInGrid(bottomRight, {x: bottomRight.x, y: topLeft.y}, setToWall);
        forEachOnLineInGrid({x: bottomRight.x, y: topLeft.y}, topLeft, setToWall);
    }

    public giveVision(center: Position, radius: number): string[] {
        const discoveryTexts: string[] = [];
        for(let y = center.y - radius; y <= center.y + radius; y += 1) {
            if (this.tiles[y] != null) {
                for(let x = center.x - radius; x <= center.x + radius; x += 1) {
                    const isInCircle = (x - center.x) * (x - center.x) + (y - center.y) * (y - center.y) < radius*radius;
                    const tile = this.tiles[y][x];
                    if (tile != null && isInCircle && !tile.visible) {
                        // raycast towards center; if you hit a wall, then don't be visible. otherwise, be visible.
                        var isVisionBlocked = false;
                        forEachOnLineInGrid({x, y}, center, (position) => {
                            if (this.tiles[position.y][position.x].type === TileType.WALL) {
                                isVisionBlocked = true;
                                return true;
                            }
                        });
                        tile.visible = !isVisionBlocked;
                        if (tile.visible && tile.type === TileType.DOWNSTAIRS) {
                            discoveryTexts.push("You discover a pathway down!");
                        }
                    }
                }
            }
        }
        return discoveryTexts;
    }

    public lifelikeEvolve(ruleset: string) {
        const ca = new LifeLikeCA(this, ruleset);
        ca.simulate();
    }

    static generateRandomWalls(width: number, height: number, percentage: number): Map {
        const map: Tile[][] = [];
        for(let y = 0; y < height; y += 1) {
            const row = [];
            for(let x = 0; x < width; x += 1) {
                row.push({
                    visible: false,
                    type: Math.random() < percentage ? TileType.WALL : TileType.SPACE
                });
            }
            map.push(row);
        }
        const downstairsX = Math.floor(Math.random() * width);
        const downstairsY = Math.floor(Math.random() * height);
        map[downstairsY][downstairsX].type = TileType.DOWNSTAIRS;
        return new Map(map);
    }
}

export interface ILevel {
    map: Map;
    entities: IEntity[];
}

class LifeLikeCA {
    public map: Map;
    public survive: boolean[];
    public birth: boolean[];

    constructor(map: Map, surviveBirth: string) {
        this.map = map;
        const [surviveString, birthString] = surviveBirth.split("/");
        this.survive = [];
        this.birth = [];
        for(let i = 0; i <= 8; i++) {
            if (surviveString.indexOf(`${i}`) !== -1) {
                this.survive[i] = true;
            } else {
                this.survive[i] = false;
            }

            if (birthString.indexOf(`${i}`) !== -1) {
                this.birth[i] = true;
            } else {
                this.birth[i] = false;
            }
        }
    }

    private getNumAliveNeighbors(x: number, y: number) {
        let numAlive = 0;
        for(let yi = y - 1; yi <= y + 1; yi += 1) {
            if (this.map.tiles[yi] != null) {
                for(let xi = x - 1; xi <= x + 1; xi += 1) {
                    if (!(yi === y && xi === x) && this.map.tiles[yi][xi] != null && this.map.tiles[yi][xi].type === TileType.WALL) {
                        numAlive += 1;
                    }
                }
            }
        }
        return numAlive;
    }

    private computeNextState(x: number, y: number): Tile {
        const currentState = this.map.tiles[y][x];
        const aliveNeighbors = this.getNumAliveNeighbors(x, y);
        let type: TileType = currentState.type;
        switch(currentState.type) {
            case TileType.SPACE:
                if (this.birth[aliveNeighbors] == true) {
                    type = TileType.WALL;
                } else {
                    type = TileType.SPACE;
                }
                break;
            case TileType.WALL:
                if (this.survive[aliveNeighbors] == true) {
                    type = TileType.WALL;
                } else {
                    type = TileType.SPACE;
                }
                break;
        }
        return {
            visible: currentState.visible,
            type: type
        };
    }

    simulate() {
        const {width, height} = this.map;
        // clone map
        const newTiles = clone(this.map.tiles);
        for(let y = 0; y < height; y += 1) {
            for(let x = 0; x < width; x += 1) {
                const nextState = this.computeNextState(x, y);
                newTiles[y][x] = nextState;
            }
        }
        this.map.tiles = newTiles;
    }
}

export function generateMap() {
    let map = Map.generateRandomWalls(60, 30, 0.25);
    repeat(5, () => map.lifelikeEvolve("1234/3"));
    repeat(100, () => map.lifelikeEvolve("45678/3"));
    repeat(7, () => map.lifelikeEvolve("1234/3"));
    map.outlineRectWithWalls();
    return map;
}
