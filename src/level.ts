/* tslint:disable */

import { forEachOnLineInGrid, forEachInRect, forEachInCircle, Position } from "./math";
import { Entity } from "./entity";
import { clone, repeat } from "./util";

export enum TileType {
    SPACE = 0,
    WALL = 1,
    DOWNSTAIRS = 2,
    UPSTAIRS = 3,
    DECORATIVE_SPACE = 4
}

export interface Tile {
    visible: boolean;
    explored: boolean;
    type: TileType;
}

/**
 * A 2D grid of tiles. Map's update model is to mutate in-place but also has a copy method,
 * so you usually want to copy the old state and then mutate to your heart's content before passing
 * it back to Redux.
 */
export class Map {
    constructor(private tiles: Tile[][]) {}

    clone(): Map {
        return new Map(clone(this.tiles));
    }

    get width() {
        return this.tiles[0].length;
    }

    get height() {
        return this.tiles.length;
    }

    public get(x: number, y: number, then?: (Tile) => void): Tile {
        const row = this.tiles[y];
        if (row != null) {
            const tile = row[x];
            if (tile != null && then != null) {
                then(tile);
            }
            return tile;
        }
    }

    public getTiles() {
        return this.tiles;
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

    // lose immediate sight of the given area (turning any visible areas into just explored areas)
    public removeVision(center: Position, radius: number) {
        forEachInCircle(center, radius, ({x, y}) => {
            this.get(x, y, (tile) => {
                tile.visible = false;
            });
        });
    }

    public giveVision(center: Position, radius: number): string[] {
        const discoveryTexts: string[] = [];
        forEachInCircle(center, radius, ({x, y}) => {
            this.get(x, y, (tile) => {
                if (!tile.visible) {
                    var isVisionBlocked = false;
                    forEachOnLineInGrid({x, y}, center, (position) => {
                        if (this.tiles[position.y][position.x].type === TileType.WALL) {
                            isVisionBlocked = true;
                            return true;
                        }
                    });
                    tile.visible = !isVisionBlocked;
                    if (tile.visible) {
                        tile.explored = true;
                    }
                    if (tile.visible && tile.type === TileType.DOWNSTAIRS) {
                        discoveryTexts.push("You discover a pathway down!");
                    }
                }
            });
        });
        return discoveryTexts;
    }

    public lifelikeEvolve(ruleset: string) {
        const ca = new LifeLikeCA(this, ruleset);
        this.tiles = ca.simulate();
    }

    public getDownstairsPosition(): Position {
        for(let y = 0; y < this.height; y += 1) {
            for(let x = 0; x < this.width; x += 1) {
                if (this.tiles[y][x].type === TileType.DOWNSTAIRS) {
                    return {x, y};
                }
            }
        }
    }

    public setImportantTile(p: Position, type: TileType) {
        forEachInRect({x: p.x - 1, y: p.y - 1},
                      {x: p.x + 1, y: p.y + 1},
                      (p) => this.tiles[p.y][p.x].type = TileType.DECORATIVE_SPACE);
        this.tiles[p.y][p.x].type = type;
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
        return new Map(map);
    }
}

export class Level {
    constructor(public map: Map, public entities: Entity[]) {}

    public isVisible(entity: Entity) {
        return this.map.get(entity.position.x, entity.position.y).visible;
    }

    // perform AI update on each entity that isn't the user
    update() {
        // this.entities.map()
    }
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
        for(var yi = y - 1; yi <= y + 1; yi += 1) {
            for(var xi = x - 1; xi <= x + 1; xi += 1) {
                this.map.get(xi, yi, (tile) => {
                    if (!(yi === y && xi === x) && tile.type === TileType.WALL) {
                        numAlive += 1;
                    }
                });
            }
        }
        return numAlive;
    }

    private computeNextState(x: number, y: number): Tile {
        const currentState = this.map.get(x, y);
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
            explored: currentState.explored,
            type: type
        };
    }

    simulate() {
        const {width, height} = this.map;
        // clone map
        const newTiles = clone(this.map.getTiles());
        for(let y = 0; y < height; y += 1) {
            for(let x = 0; x < width; x += 1) {
                const nextState = this.computeNextState(x, y);
                newTiles[y][x] = nextState;
            }
        }
        return newTiles;
    }
}

export function generateMap(upstairs: Position) {
    const width = 60,
          height = 30;
    let map = Map.generateRandomWalls(width, height, 0.25);

    repeat(5, () => map.lifelikeEvolve("1234/3"));
    repeat(100, () => map.lifelikeEvolve("45678/3"));
    repeat(7, () => map.lifelikeEvolve("1234/3"));

    const inset = 3;
    const downstairsX = inset + Math.floor(Math.random() * (width - inset*2));
    const downstairsY = inset + Math.floor(Math.random() * (height - inset*2));
    map.setImportantTile({x: downstairsX, y: downstairsY}, TileType.DOWNSTAIRS);
    map.setImportantTile(upstairs, TileType.UPSTAIRS);

    map.outlineRectWithWalls();
    return map;
}
