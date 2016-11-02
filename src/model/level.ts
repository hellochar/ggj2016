import { forEachOnLineInGrid, forEachInRect, forEachInCircle, IPosition } from "../math";
import { clone, repeat } from "../util";
import * as Entity from "./entity";

export enum TileType {
    SPACE = 0,
    WALL = 1,
    DOWNSTAIRS = 2,
    UPSTAIRS = 3,
    DECORATIVE_SPACE = 4,
}

export interface ITile {
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
    public static generateRandomWalls(width: number, height: number, percentage: number): Map {
        const map: ITile[][] = [];
        for (let y = 0; y < height; y += 1) {
            const row: ITile[] = [];
            for (let x = 0; x < width; x += 1) {
                row.push({
                    explored: false,
                    visible: false,
                    type: Math.random() < percentage ? TileType.WALL : TileType.SPACE
                });
            }
            map.push(row);
        }
        return new Map(map);
    }

    constructor(private tiles: ITile[][]) {}

    public clone(): Map {
        return new Map(clone(this.tiles));
    }

    get width() {
        return this.tiles[0].length;
    }

    get height() {
        return this.tiles.length;
    }

    public get(x: number, y: number, then?: (t: ITile) => void): ITile {
        const row = this.tiles[y];
        if (row != null) {
            const tile = row[x];
            if (tile != null && then != null) {
                then(tile);
            }
            return tile;
        } else {
            return undefined;
        }
    }

    public getTiles() {
        return this.tiles;
    }

    public isTileObstructed(p: IPosition) {
        return this.get(p.x, p.y).type === TileType.WALL;
    }

    // inline mutation
    public outlineRectWithWalls(topLeft: IPosition = {x: 0, y: 0},
                                bottomRight: IPosition = {x: this.width - 1, y: this.height - 1}) {
        const setToWall = (p: IPosition) => {
            this.tiles[p.y][p.x].type = TileType.WALL;
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
                this.tiles[y][x].type = TileType.DECORATIVE_SPACE;
            });
        }
    }

    // lose immediate sight of the given area (turning any visible areas into just explored areas)
    public removeVision(center: IPosition, radius: number) {
        forEachInCircle(center, radius, ({x, y}) => {
            this.get(x, y, (tile) => {
                tile.visible = false;
            });
        });
    }

    public giveVision(center: IPosition, radius: number) {
        forEachInCircle(center, radius, ({x, y}) => {
            this.get(x, y, (tile) => {
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
                }
            });
        });
    }

    public lifelikeEvolve(ruleset: string) {
        const ca = new LifeLikeCA(this, ruleset);
        this.tiles = ca.simulate();
    }

    public getDownstairsPosition(): IPosition {
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
        this.tiles[p.y][p.x].type = type;
    }
}

export class Level {
    /**
     * ids of the entities in this level.
     */
    public entities: string[];

    constructor(public id: string, public map: Map, entities: string[]) {
        this.entities = entities;
    }

    public isVisible(position: IPosition) {
        return this.map.get(position.x, position.y).visible;
    }

    private leafConcentration(x: number, y: number) {
        const { sin, cos } = Math;
        return sin(x + sin(y)) * cos(y + cos(x));
    }

    // add entities and people
    public addVillage(): Entity.Entity[] {
        const numHomes = _.random(1, 5);
        // center of the homes
        const RANGE = 4;
        const position = {
            x: _.random(RANGE + 1, this.map.width - RANGE - 1),
            y: _.random(RANGE + 1, this.map.height - RANGE - 1)
        };

        const entities: Entity.Entity[] = [];

        _.times(numHomes, () => {
            let newPosition: IPosition;
            do {
                newPosition = {
                    x: position.x + _.random(-RANGE, RANGE + 1),
                    y: position.y + _.random(-RANGE, RANGE + 1),
                };
            } while (this.map.isTileObstructed(newPosition));

            const home: Entity.IHouse = {
                id: Math.random().toString(16).substring(2),
                type: "house",
                position: newPosition,
            };

            this.entities.push(home.id);
            entities.push(home);

            const person: Entity.IMercury = {
                id: Math.random().toString(16).substring(2),
                type: "mercury",
                position: newPosition,
                // name: Math.random().toString(36).substring(7), // random string
                health: 10,
                maxHealth: 10,
                inventory: {
                    itemIds: [],
                    maxSize: 20,
                },
            };

            this.entities.push(person.id);
            entities.push(person);
        });

        return entities;
    }

    /**
     * Create a bunch of leaves and add references to them. The caller must immediately
     * add them to the game.
     */
    public addLeaves(): Entity.ILeaf[] {
        const offsetX = Math.random() * 100;
        const offsetY = Math.random() * 100;
        const leaves: Entity.ILeaf[] = [];
        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
                if (this.map.get(x, y).type === TileType.SPACE) {
                    const z = this.leafConcentration(x * 0.15 + offsetX, y * 0.15 + offsetY);
                    if (z > 0.5) {
                        const id = Math.random().toString(16).substring(2);
                        const leaf: Entity.ILeaf = {
                            health: 1 + Math.floor(z * 5),
                            id,
                            maxHealth: 5,
                            position: { x, y },
                            type: "leaf",
                        };
                        leaves.push(leaf);
                        this.entities.push(id);
                    }
                }
            }
        }
        return leaves;
    }

    public placeRing() {
        const ringPosition = this.map.getDownstairsPosition();
        this.map.setImportantTile(ringPosition, TileType.DECORATIVE_SPACE);
        const ringEntity: Entity.IRing = {
            id: Math.random().toString(16).substring(2),
            type: "ring",
            position: ringPosition,
        };
        this.entities.push(ringEntity.id);
        return ringEntity;
    }

    // perform AI update on each entity that isn't the user
    public update() {
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
        for (let i = 0; i <= 8; i++) {
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
        for (let yi = y - 1; yi <= y + 1; yi += 1) {
            for (let xi = x - 1; xi <= x + 1; xi += 1) {
                this.map.get(xi, yi, (tile) => {
                    if (!(yi === y && xi === x) && tile.type === TileType.WALL) {
                        numAlive += 1;
                    }
                });
            }
        }
        return numAlive;
    }

    private computeNextState(x: number, y: number): ITile {
        const currentState = this.map.get(x, y);
        const aliveNeighbors = this.getNumAliveNeighbors(x, y);
        let type: TileType = currentState.type;
        switch (currentState.type) {
            case TileType.SPACE:
                if (this.birth[aliveNeighbors]) {
                    type = TileType.WALL;
                } else {
                    type = TileType.SPACE;
                }
                break;
            case TileType.WALL:
                if (this.survive[aliveNeighbors]) {
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

    public simulate() {
        const {width, height} = this.map;
        // clone map
        const newTiles = clone(this.map.getTiles());
        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                const nextState = this.computeNextState(x, y);
                newTiles[y][x] = nextState;
            }
        }
        return newTiles;
    }
}

export function generateMap(upstairs: IPosition) {
    const width = 40;
    const height = 20;
    const inset = 3;
    let map = Map.generateRandomWalls(width, height, 0.25);

    function randomX() {
        return inset + Math.floor(Math.random() * (width - inset * 2));
    }

    function randomY() {
        return inset + Math.floor(Math.random() * (height - inset * 2));
    }

    repeat(5, () => map.lifelikeEvolve("1234/3"));
    repeat(100, () => map.lifelikeEvolve("45678/3"));
    repeat(7, () => map.lifelikeEvolve("1234/3"));

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
