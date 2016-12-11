import * as _ from "lodash";

import { Map } from "./map";
import { IPosition, forEachInCircle, forEachOnLineInGrid } from "math";
import { TileType } from "model/";
import * as Entity from "model/entity";

export interface IVisibilityInfo {
    visible: boolean;
    explored: boolean;
}

export class Level {
    constructor(public id: string,
                public map: Map,
                public entities: string[],
                public visibility: IVisibilityInfo[][] = Level.generateUnexploredVisibility(map.width, map.height)) {
    }

    private static generateUnexploredVisibility(width: number, height: number): IVisibilityInfo[][] {
        const info: IVisibilityInfo[][] = [];
        for (let y = 0; y < height; y++) {
            info[y] = [];
            for (let x = 0; x < width; x++) {
                info[y][x] = {
                    explored: false,
                    visible: false,
                };
            }
        }
        return info;
    }

    public illuminated() {
        const level = new Level(this.id, this.map, this.entities, _.cloneDeep(this.visibility));
        for (let x = 0; x < level.map.width; x++) {
            for (let y = 0; y < level.map.height; y++) {
                level.visibility[y][x].explored = true;
                level.visibility[y][x].visible = true;
            }
        }
        return level;
    }
    
    /**
     * Give vision in the given circle.
     * 
     * Assigns new objects to the this.tiles that have changed.
     */
    public giveVision(center: IPosition, radius: number) {
        forEachInCircle(center, radius, ({x, y}) => {
            this.map.get(x, y, (oldTile) => {
                const oldVisibility = this.visibility[y][x];
                const visibility = _.clone(oldVisibility);
                if (!oldVisibility.visible) {
                    let isVisionBlocked = false;
                    forEachOnLineInGrid({x, y}, center, (position) => {
                        if (this.map.tiles[position.y][position.x].type === TileType.WALL) {
                            isVisionBlocked = true;
                            return true;
                        } else {
                            return false;
                        }
                    });
                    visibility.visible = !isVisionBlocked;
                    if (visibility.visible) {
                        visibility.explored = true;
                    }
                    this.visibility[y][x] = visibility;
                }
            });
        });
    }

    /**
     * Lose vision of the given circle.
     * 
     * Assigns new objects to the this.tiles that changed.
     */
    public removeVision(center: IPosition, radius: number) {
        forEachInCircle(center, radius, ({x, y}) => {
            this.map.get(x, y, (tile) => {
                this.visibility[y][x] = _.assign({}, this.visibility[y][x], { visible: false });
            });
        });
    }

    public cloneShallowVisibility(): Level {
        return new Level(this.id, this.map, this.entities, this.visibility.map((row) => row.slice()));
    }

    public withoutEntity(entityId: string) {
        return new Level(this.id, this.map, _.without(this.entities, entityId), this.visibility);
    }

    public isVisible(position: IPosition) {
        const tile = this.map.get(position.x, position.y);
        if (tile !== undefined) {
            return this.visibility[position.y][position.x].visible;
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
            } while (this.map.get(newPosition.x, newPosition.y).type === TileType.WALL);

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
