import * as _ from "lodash";

import { Map } from "./map";
import { IPosition, forEachInCircle, rasterizedLine } from "math";
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
        forEachInCircle(center, radius, (p) => {
            this.map.get(p, (oldTile) => {
                const oldVisibility = this.visibility[p.y][p.x];
                const visibility = _.clone(oldVisibility);
                if (!oldVisibility.visible) {
                    const isVisionBlocked = rasterizedLine(p, center).anyMatch((p) => this.map.get(p).type === TileType.WALL);
                    visibility.visible = !isVisionBlocked;
                    if (visibility.visible) {
                        visibility.explored = true;
                    }
                    this.visibility[p.y][p.x] = visibility;
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
        forEachInCircle(center, radius, (p) => {
            this.map.get(p, (tile) => {
                this.visibility[p.y][p.x] = _.assign({}, this.visibility[p.y][p.x], { visible: false });
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
        const tile = this.map.get(position);
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
        /**
         * Find a spot that has at least some open space.
         * Flood fill from that area and add homes in randomly chosen areas in the floodfilled space.
         * Try this 10 times; abort if failed.
         */
        const VILLAGE_SIZE = 50;

        const maybeOpenArea = this.map.randomMapPoints()
            .limit(10)
            .map((possibleCenter) => this.map.floodFill(
                possibleCenter,
                (position) => {
                    const tile = this.map.get(position);
                    return tile.type === TileType.DIRT || tile.type === TileType.GRASS;
                }).limit(VILLAGE_SIZE).toArray())
            .filter((possibleArea) => possibleArea.length === VILLAGE_SIZE)
            .findFirst();

        const maybeVillage = maybeOpenArea.map((villageTiles) => {
            villageTiles.forEach((position) => this.map.set(position, { type: TileType.PAVED_FLOOR }));

            const entities: Entity.Entity[] = [];

            const numHomes = _.random(3, 15);

            let possibleHomeTiles = villageTiles.slice();

            _.times(numHomes, () => {
                const newPosition = _.sample(possibleHomeTiles);
                possibleHomeTiles = _.without(possibleHomeTiles, newPosition);
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
        });

        return maybeVillage.orElse([]);
    }

    /**
     * Add trees. The caller should add them to the game.
     */
    public addTrees(): Entity.ITree[] {
        const offsetX = Math.random() * 100;
        const offsetY = Math.random() * 100;
        const trees: Entity.ITree[] = [];
        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
                if (this.map.get({x, y}).type === TileType.GRASS) {
                    const z = this.treeTexture(x * 0.75 + offsetX, y * 0.75 + offsetY) + Math.random() * 0.25;
                    if (z > 0.55) {
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
        this.map.setImportantTile(ringPosition, { type: TileType.PAVED_FLOOR, decorative: true });
        const ringEntity: Entity.IRing = {
            id: Math.random().toString(16).substring(2),
            type: "ring",
            position: ringPosition,
        };
        this.entities.push(ringEntity.id);
        return ringEntity;
    }
}
