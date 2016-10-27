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
    constructor(public health: number,
                public maxHealth: number,
                public name: string,
                public position: Position) {
    }

    abstract clone(): this;

    abstract iconClass(): string;

    abstract decideNextAction(state: IState): void;

    move(offset: Position) {
        this.position = {
            x: this.position.x + offset.x,
            y: this.position.y + offset.y
        };
    }
}

export class User extends Entity {
    constructor(p: Position) {
        super(10, 10, "hellochar", p);
    }

    iconClass() { return 'fa-user user'; }

    decideNextAction(state: IState) {
        // do nothing
    }

    clone() {
        const newUser = new User(clone(this.position));
        newUser.health = this.health;
        newUser.maxHealth = this.maxHealth;
        newUser.name = this.name;
        return newUser as this;
    }
}

export class Mercury extends Entity {
    constructor(p: Position) {
        super(25, 25, "Mercury", p);
    }

    iconClass() { return 'fa-mercury'; }

    decideNextAction(state: IState) {
        // do nothing
    }

    clone() {
        const newMercury = new Mercury(clone(this.position));
        newMercury.health = this.health;
        newMercury.maxHealth = this.maxHealth;
        newMercury.name = this.name;
        return newMercury as this;
    }
}

export class Ring extends Entity {
    constructor(p: Position) {
        super(0, 0, "Ring", p);
    }

    iconClass() { return 'fa-circle-o-notch item important'; }

    decideNextAction(state: IState) {
        // do nothing
    }

    clone() {
        const newRing = new Ring(clone(this.position));
        newRing.health = this.health;
        newRing.maxHealth = this.maxHealth;
        newRing.name = this.name;
        return newRing as this;
    }
}

export class Leaf extends Entity {
    constructor(health: number, p: Position) {
        super(health, 5, "Leaf", p);
    }

    public iconClass() {
        if (this.health > 4) {
            return "fa-pagelines item";
        } else {
            return "fa-leaf item";
        }
    }

    public decideNextAction() {}

    public clone() {
        const newLeaf = new Leaf(this.health, clone(this.position));
        return newLeaf as this;
    }
}
