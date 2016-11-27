import * as _ from "lodash";

import { forEachOnLineInGrid, forEachInRect, forEachInCircle, IPosition } from "math";
import { ITile, TileType } from "model/";
import * as Entity from "model/entity";

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

export class Level {
    /**
     * ids of the entities in this level.
     */
    public entities: string[];

    constructor(public id: string,
                public map: Map,
                entities: string[]) {
        this.entities = entities;
    }

    public withoutEntity(entityId: string) {
        return new Level(this.id, this.map, _.without(this.entities, entityId));
    }

    public isVisible(position: IPosition) {
        const tile = this.map.get(position.x, position.y);
        if (tile !== undefined) {
            return tile.visible;
        } else {
            return false;
        }
    }

    private treeTexture(x: number, y: number) {
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
                    x: position.x + _.random(-RANGE, RANGE),
                    y: position.y + _.random(-RANGE, RANGE),
                };
            } while (!this.map.isTileFree(newPosition));

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
    public addTrees(): Entity.ITree[] {
        const offsetX = Math.random() * 100;
        const offsetY = Math.random() * 100;
        const trees: Entity.ITree[] = [];
        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
                if (this.map.get(x, y).type === TileType.SPACE) {
                    const z = this.treeTexture(x * 0.35 + offsetX, y * 0.35 + offsetY) + Math.random() * 0.25 - 0.125;
                    if (z > 0.98) {
                        const id = Math.random().toString(16).substring(2);
                        const tree: Entity.ITree = {
                            id,
                            position: { x, y },
                            type: "tree",
                        };
                        trees.push(tree);
                        this.entities.push(id);
                    }
                }
            }
        }
        return trees;
    }

    public placeRing() {
        const ringPosition = this.map.getDownstairsPosition();
        if (ringPosition == null) {
            throw new Error("ringPosition somehow null!");
        }
        this.map.setImportantTile(ringPosition, TileType.DECORATIVE_SPACE);
        const ringEntity: Entity.IRing = {
            id: Math.random().toString(16).substring(2),
            type: "ring",
            position: ringPosition,
        };
        this.entities.push(ringEntity.id);
        return ringEntity;
    }
}
