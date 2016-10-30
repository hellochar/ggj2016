/* tslint:disable */

/**

to implement:
fa-pied-piper-alt as a dart blower
fa-odnoklassniki as a POWERMAN;  see also fa-odnoklassniki-square for an alternate version

 other ideas:

fa-rebel for some crazy item/insignia
fa-tencent-weibo as a flower icon
fa-xing and fa-modx as origami
fa-ge as some crazy power core
fa-pagelines as a leaf of peace


misc cool ones:

fa-500px, fa-deviantart, fa-forumbee, fa-gg, fa-opencart

*/

import { Position } from "../math";
import { clone } from "../util";
import { IState } from "../state";
import * as Actions from "./action";

/**
 * 1. Make entities only move by returning Redux Actions.

 * Worry: we're mixing game actions (such as open/close the UI) with game-model actions (such as entity moves).
 * solution: Each entity has its own Redux Store which accepts game-model actions.
 *
 * Separately, we have the global game store which, as part of its state, holds all of the individual entities' states.
 */

// An Entity is really just a bag of properties. To clone one, you just
// need to copy all its properties to a new object. The contract for Entities
// is that their constructors can have no side effects. All methods do is either
// mutate the Entity's exposed members.
export abstract class Entity {
    constructor(public id: string,
                public health: number,
                public maxHealth: number,
                public name: string,
                public position: Position) {
    }

    /**
     * Mutate this entity by offsetting the position.
     */
    public move(offset: Position) {
        this.position = {
            x: this.position.x + offset.x,
            y: this.position.y + offset.y
        };
    }

    abstract clone(): this;

    abstract iconClass(): string;
}

export abstract class Item extends Entity {
}

/**
 * An actor is an Entity that is placed in the turn order and can take actions when it is
 * that actor's turn.
 */
export abstract class Actor extends Entity {
    abstract decideNextAction(state: IState): Actions.Action;
}

export class User extends Actor {
    constructor(id: string, p: Position) {
        super(id, 10, 10, "hellochar", p);
    }

    iconClass() { return 'fa-user user'; }

    decideNextAction(state: IState) {
        return null; // TODO fill user movement into this
    }

    clone() {
        const newUser = new User(this.id, clone(this.position));
        newUser.health = this.health;
        newUser.maxHealth = this.maxHealth;
        newUser.name = this.name;
        return newUser as this;
    }
}

export class Mercury extends Actor {
    constructor(id: string, p: Position) {
        super(id, 25, 25, "Mercury", p);
    }

    iconClass() { return 'fa-mercury'; }

    decideNextAction(state: IState): Actions.Action {
        const possibleActions: Actions.Action[] = [
            {
                type: "nothing"
            }, {
                direction: "up",
                type: "move"
            }, {
                direction: "down",
                type: "move"
            }, {
                direction: "left",
                type: "move"
            },{
                direction: "right",
                type: "move"
            }
        ];
        return _.sample(possibleActions);
    }

    clone() {
        const newMercury = new Mercury(this.id, clone(this.position));
        newMercury.health = this.health;
        newMercury.maxHealth = this.maxHealth;
        newMercury.name = this.name;
        return newMercury as this;
    }
}

export class Ring extends Item {
    constructor(id: string, p: Position) {
        super(id, 0, 0, "Ring", p);
    }

    iconClass() { return 'fa-circle-o-notch important'; }

    clone() {
        const newRing = new Ring(this.id, clone(this.position));
        newRing.health = this.health;
        newRing.maxHealth = this.maxHealth;
        newRing.name = this.name;
        return newRing as this;
    }
}

export class Tree extends Actor {
    constructor(id: string, p: Position) {
        super(id, 1, 1, "Tree", p);
    }

    public decideNextAction(state: IState): Actions.Action {
        return { type: "nothing" };
    }

    public iconClass() {
        return "fa-tree";
    }

    public clone() {
        return new Tree(this.id, clone(this.position)) as this;
    }
}

export class Leaf extends Item {
    constructor(id: string, health: number, p: Position) {
        super(id, health, 5, "Leaf", p);
    }

    public iconClass() {
        if (this.health > 4) {
            return "fa-pagelines";
        } else {
            return "fa-leaf";
        }
    }

    public clone() {
        const newLeaf = new Leaf(this.id, this.health, clone(this.position));
        return newLeaf as this;
    }
}