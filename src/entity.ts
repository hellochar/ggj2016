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

import { Position } from "./math";
import { clone } from "./util";

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

    clone() {
        const newRing = new Ring(clone(this.position));
        newRing.health = this.health;
        newRing.maxHealth = this.maxHealth;
        newRing.name = this.name;
        return newRing as this;
    }
}
