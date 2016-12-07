import * as _ from "lodash";

import { ITile, TileType } from "model/tile";
import { Map } from "model/map";

/**
 * Internal structure used to run CA simulations.
 */
export class LifeLikeCA {
    public survive: boolean[];
    public birth: boolean[];

    constructor(rule: string) {
        const match = rule.match(/B([0-8]*)\/S([0-8]*)/);
        if (match == null) {
            throw new Error("Invalid CA rule " + match);
        }
        const [, birthString, surviveString] = match;
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

    private getNumAliveNeighbors(map: Map, x: number, y: number) {
        let numAlive = 0;
        for (let yi = y - 1; yi <= y + 1; yi += 1) {
            for (let xi = x - 1; xi <= x + 1; xi += 1) {
                map.get(xi, yi, (tile) => {
                    if (!(yi === y && xi === x) && tile.type === TileType.WALL) {
                        numAlive += 1;
                    }
                });
            }
        }
        return numAlive;
    }

    private computeNextState(map: Map, x: number, y: number): ITile {
        const currentState = map.get(x, y)!;
        const aliveNeighbors = this.getNumAliveNeighbors(map, x, y);
        switch (currentState.type) {
            case TileType.SPACE:
                if (this.birth[aliveNeighbors]) {
                    return {
                        type: TileType.WALL,
                        color: map.colorTheme[map.colorTheme.length - 1],
                    };
                } else {
                    return { type: TileType.SPACE };
                }
            case TileType.WALL:
                if (this.survive[aliveNeighbors]) {
                    const currentColorIndex = map.colorTheme.indexOf(currentState.color);
                    const newColorIndex = Math.max(currentColorIndex - Math.random() < 0.1 ? 1 : 0, 0);
                    return {
                        type: TileType.WALL,
                        color: map.colorTheme[newColorIndex],
                    };
                } else {
                    return { type: TileType.SPACE };
                }
        }
        return currentState;
    }

    public simulate(times: number): (map: Map) => void {
        console.log("using ", this);
        return (map: Map) => {
            const {width, height} = map;
            // clone map
            for (let t = 0; t < times; t++) {
                const newTiles: ITile[][] = _.cloneDeep(map.getTiles());
                for (let y = 0; y < height; y += 1) {
                    for (let x = 0; x < width; x += 1) {
                        const nextState = this.computeNextState(map, x, y);
                        newTiles[y][x] = nextState;
                    }
                }
                map.tiles = newTiles;
            }
        };
    }
}
