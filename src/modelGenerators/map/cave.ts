import * as _ from "lodash";

import { Map } from "model/level";
import { generateRandomWalls } from "./randomWalls";
import { LifeLikeCA } from "./cellularAutomata";

export function generateCaveStructure(width: number, height: number, colorTheme: string[]) {
    // TODO look at http://psoup.math.wisc.edu/mcell/rullex_life.html
    const algorithms: { [name: string]: () => Map } = {
        // makes dense linear mazes with long passageways
        "MazeMine": () => {
            const map = generateRandomWalls(width, height, 0.25, colorTheme);
            const ca = new LifeLikeCA(map, "B3/S1234");
            ca.simulate(100);
            return map;
        },

        // Replicator - makes dense chaos with all-random
        // Also to note - can create complex growing patterns from one (or a few)
        // cells
        "Replicator": () => {
            const map = generateRandomWalls(width, height, 0.25, colorTheme);
            const ca = new LifeLikeCA(map, "B1357/S1357");
            ca.simulate(100);
            return map;
        },

        // seeds - generally chaotic growth. Spacious.
        "Seeds": () => {
            const map = generateRandomWalls(width, height, 0.25, colorTheme);
            const ca = new LifeLikeCA(map, "B2/S");
            ca.simulate(100);
            return map;
        },

        // unnamed - generally chaotic growth. A bit denser than seeds.
        "DenserSeeds": () => {
            const map = generateRandomWalls(width, height, 0.25, colorTheme);
            const ca = new LifeLikeCA(map, "B25/S4");
            ca.simulate(100);
            return map;
        },

        // // life without death - quickly fills up most of the space and leaves
        // // only tiny disconnected spaces.
        // // continued iteration creates beautiful natural looking coral like growths
        // "B3/S012345678",

        // 3-4 life; chaotic but more interesting/complex spaces; creates nice pockets
        // of space versus rock
        "3-4Life": () => {
            const map = generateRandomWalls(width, height, 0.25, colorTheme);
            const ca = new LifeLikeCA(map, "B34/S34");
            ca.simulate(100);
            return map;
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
            const map = generateRandomWalls(width, height, 0.25, colorTheme);
            const ca = new LifeLikeCA(map, "B234/S");
            ca.simulate(100);
            return map;
        },

        // walled cities - rand(0.25) turns into a bunch of self-contained "cities"
        // with a continuous shell and oscillating interior. Interior is generally
        // chaotic with disconnected but whole spaces
        "WalledCities": () => {
            const map = generateRandomWalls(width, height, 0.25, colorTheme);
            const ca = new LifeLikeCA(map, "B45678/S2345");
            ca.simulate(100);
            return map;
        },

        // Assimilator - rand(0.25) turns into a few spaced out amoebas that never die
        // their insides are many single disconnected spaces. the outer edge is jagged.
        "Assimilator": () => {
            const map = generateRandomWalls(width, height, 0.25, colorTheme);
            const ca = new LifeLikeCA(map, "B345/S4567");
            ca.simulate(100);
            return map;
        },
    };

    const algorithm = _.sample(algorithms);
    const map = algorithm();
    return map;
}
