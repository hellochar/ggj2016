import * as _ from "lodash";

import { Map } from "./map";
import { IPosition } from "math";
import { TileType } from "model/";
import * as Entity from "model/entity";

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
