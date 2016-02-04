/* tslint:disable */

import { Position } from "./math";


/** other ideas:

fa-rebel for some crazy item/insignia
fa-tencent-weibo as a flower icon
fa-xing and fa-modx as origami
fa-ge as some crazy power core
fa-pagelines as a leaf of peace


misc cool ones:

fa-500px, fa-deviantart, fa-forumbee, fa-gg, fa-opencart

*/

export enum EntityType {
    USER,
    MERCURY,
    PIED_PIPER,
    POWERMAN,
    RING
}

export interface IEntity extends Position {
    health: number;
    maxHealth: number;
    type: EntityType;
    name?: string;
}
