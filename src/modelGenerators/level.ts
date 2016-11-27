/**
 * Holds methods for generating Level objects. The primary responsibility is new creation of Levels from input
 * parameters such as random seed, or descriptive quantities e.g. difficulty/cave-like-ness/etc.
 */

import * as _ from "lodash";

import { Map } from "model/level";
import { ITile, TileType, IWallTile } from "model/tile";
import { IPosition } from "math";

export function generateMap(upstairs: IPosition, colorTheme: string[]) {
    const width = 60;
    const height = 30;
    let map = generateRandomWalls(width, height, 0.25, colorTheme);

    // _.times(5, () => map.lifelikeEvolve("B3/S1234"));
    // _.times(100, () => map.lifelikeEvolve("B3/S45678"));
    // _.times(7, () => map.lifelikeEvolve("B3/S1234"));

    // TODO look at http://psoup.math.wisc.edu/mcell/rullex_life.html
    const ruleSets = [
        // MazeMine - makes dense linear mazes with long passageways
        "B3/S1234",

        // Replicator - makes dense chaos with all-random
        // Also to note - can create complex growing patterns from one (or a few)
        // cells
        "B1357/S1357",

        // seeds - generally chaotic growth. Spacious.
        "B2/S",

        // unnamed - generally chaotic growth. A bit denser than seeds.
        "B25/S4",

        // // life without death - quickly fills up most of the space and leaves
        // // only tiny disconnected spaces.
        // // continued iteration creates beautiful natural looking coral like growths
        // "B3/S012345678",

        // 3-4 life; chaotic but more interesting/complex spaces; creates nice pockets
        // of space versus rock
        "B34/S34",

        // diamoeba - will almost always die with rand(0.25). At larger scales
        // (300x200), depending on initial density, will form large amoeba shapes
        // whose insides are completely filled with diagonals made of jagged on/offs
        // that grow and shrink
        // "B35678/S5678",

        // day and night - will usually die at rand(0.25). At rand(0.5), clusters
        // and makes nice blobs/formations at ~20-30 iterations
        // at higher densities, continuous blobs will form with jagged edges
        // that slowly erode over time
        // "B3678/S34678",

        // Plow World - very dense space filling; makes organic growths over time
        // "B378/S012345678",

        // Persian Rug - chaotic at rand(0.25); spacious and generally connected on the inside
        // intricate patterns form from a few initial cells
        // has an outer shell vs the chaotic inside
        "B234/S",

        // walled cities - rand(0.25) turns into a bunch of self-contained "cities"
        // with a continuous shell and oscillating interior. Interior is generally
        // chaotic with disconnected but whole spaces
        "B45678/S2345",

        // Assimilator - rand(0.25) turns into a few spaced out amoebas that never die
        // their insides are many single disconnected spaces. the outer edge is jagged.
        "B345/S4567",
    ];

    let ruleset = _.sample(ruleSets);
    const ca = new LifeLikeCA(map, ruleset);
    _.times(100, () => {
        const newTiles = ca.simulate();
        map.tiles = newTiles;
    });

    console.log("using ", ruleset);

    const inset = 3;
    function randomX() {
        return inset + Math.floor(Math.random() * (width - inset * 2));
    }

    function randomY() {
        return inset + Math.floor(Math.random() * (height - inset * 2));
    }

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

/**
 * Generate a map with each tile randomly chosen to be a wall with the given percentage, or a space otherwise.
 */
export function generateRandomWalls(width: number, height: number, percentage: number, colorTheme: string[]): Map {
    const map: ITile[][] = [];
    for (let y = 0; y < height; y += 1) {
        const row: ITile[] = [];
        for (let x = 0; x < width; x += 1) {
            if (Math.random() < percentage) {
                row.push({
                    explored: false,
                    visible: false,
                    type: TileType.WALL,
                    color: colorTheme[colorTheme.length - 1],
                } as IWallTile);
            } else {
                row.push({
                    explored: false,
                    visible: false,
                    type: TileType.SPACE,
                });
            }
        }
        map.push(row);
    }
    return new Map(map, colorTheme);
}

class LifeLikeCA {
    public map: Map;
    public survive: boolean[];
    public birth: boolean[];

    constructor(map: Map, rule: string) {
        this.map = map;
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
        const currentState = this.map.get(x, y)!;
        const aliveNeighbors = this.getNumAliveNeighbors(x, y);
        const { explored, visible } = currentState;
        switch (currentState.type) {
            case TileType.SPACE:
                if (this.birth[aliveNeighbors]) {
                    return {
                        type: TileType.WALL,
                        explored,
                        visible,
                        color: this.map.colorTheme[this.map.colorTheme.length - 1],
                    };
                } else {
                    return {
                        type: TileType.SPACE,
                        explored,
                        visible
                    };
                }
            case TileType.WALL:
                if (this.survive[aliveNeighbors]) {
                    const currentColorIndex = this.map.colorTheme.indexOf(currentState.color);
                    const newColorIndex = Math.max(currentColorIndex - Math.random() < 0.1 ? 1 : 0, 0);
                    return {
                        type: TileType.WALL,
                        explored,
                        visible,
                        color: this.map.colorTheme[newColorIndex],
                    };
                } else {
                    return {
                        type: TileType.SPACE,
                        explored,
                        visible,
                    };
                }
        }
        return currentState;
    }

    public simulate() {
        const {width, height} = this.map;
        // clone map
        const newTiles = _.cloneDeep(this.map.getTiles());
        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                const nextState = this.computeNextState(x, y);
                newTiles[y][x] = nextState;
            }
        }
        return newTiles;
    }
}
