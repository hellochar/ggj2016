/* tslint:disable */

import { Level } from "./model/level";

export interface IState {
    /** Array of levelIds. */
    levelOrder: string[];
    levels: {
        [levelId: string]: Level;
    };
}
