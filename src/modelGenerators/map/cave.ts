import * as _ from "lodash";

import { Map } from "model/level";
import { fillWithRandomWalls } from "./randomWalls";
import { LifeLikeCA } from "./cellularAutomata";
import { ITile, TileType } from "model/";

export interface IMapMutator {
    (map: Map): void;
}

export function emptyMap(width: number, height: number, colorTheme: string[]) {
    const tiles: ITile[][] = _.fill(new Array(height), null).map(() => _.fill(new Array(width), {
        type: TileType.SPACE,
        visible: false,
        explored: false,
    }));
    return new Map(tiles, colorTheme);
}

function compose(...functions: IMapMutator[]): IMapMutator {
    return (map: Map) => {
        functions.forEach((fn) => {
            fn(map);
        });
    };
}

// TODO look at http://psoup.math.wisc.edu/mcell/rullex_life.html
const GENERATION_ALGORITHMS: { [name: string]: () => IMapMutator } = {
    // makes dense linear mazes with long passageways
    "MazeMine": () => {
        const ca = new LifeLikeCA("B3/S1234");
        return compose(fillWithRandomWalls(0.25), ca.simulate(100));
    },

    // Replicator - makes dense chaos with all-random
    // Also to note - can create complex growing patterns from one (or a few)
    // cells
    "Replicator": () => {
        const ca = new LifeLikeCA("B1357/S1357");
        return compose(fillWithRandomWalls(0.25), ca.simulate(100));
    },

    // seeds - generally chaotic growth. Spacious.
    "Seeds": () => {
        const ca = new LifeLikeCA("B2/S");
        return compose(fillWithRandomWalls(0.25), ca.simulate(100));
    },

    // unnamed - generally chaotic growth. A bit denser than seeds.
    "DenserSeeds": () => {
        const ca = new LifeLikeCA("B25/S4");
        return compose(fillWithRandomWalls(0.25), ca.simulate(100));
    },

    // // life without death - quickly fills up most of the space and leaves
    // // only tiny disconnected spaces.
    // // continued iteration creates beautiful natural looking coral like growths
    // "B3/S012345678",

    // 3-4 life; chaotic but more interesting/complex spaces; creates nice pockets
    // of space versus rock
    "3-4Life": () => {
        const ca = new LifeLikeCA("B34/S34");
        return compose(fillWithRandomWalls(0.25), ca.simulate(100));
    },

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
    "Persian Rug": () => {
        const ca = new LifeLikeCA("B234/S");
        return compose(fillWithRandomWalls(0.25), ca.simulate(100));
    },

    // walled cities - rand(0.25) turns into a bunch of self-contained "cities"
    // with a continuous shell and oscillating interior. Interior is generally
    // chaotic with disconnected but whole spaces
    "WalledCities": () => {
        const ca = new LifeLikeCA("B45678/S2345");
        return compose(fillWithRandomWalls(0.25), ca.simulate(100));
    },

    // Assimilator - rand(0.25) turns into a few spaced out amoebas that never die
    // their insides are many single disconnected spaces. the outer edge is jagged.
    "Assimilator": () => {
        const ca = new LifeLikeCA("B345/S4567");
        return compose(fillWithRandomWalls(0.25), ca.simulate(100));
    },
};

export function generateCaveStructure(width: number, height: number, colorTheme: string[]) {
    const algorithm = _.sample(GENERATION_ALGORITHMS)();
    const map = emptyMap(width, height, colorTheme);
    algorithm(map);
    return map;
}
