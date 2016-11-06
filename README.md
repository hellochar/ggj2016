# ggj2016

## Getting started
* run **npm start** to build and start webpack-dev-server
* open **http://localhost:3333/**

## Build options
* **npm run build** for single build
* **npm run watch** for incremental builds on every file change
* **npm start** to build and start webpack-dev-server

## Ramblings
Iteration 1:
* Core game loop - there are emergent systems of NPCs in this universe and
they will interact with each other and with the game in specific ways. You,
the player, needs to observe and understand what's happening in the game -
how the NPCs are moving and interacting with each other, and how to interact
with them to influence the game to be in your favor.
* Your ultimate goal is to earn as many points as you can before you die.

Iteration 2 - simplify:
* Your ultimate goal is to retrieve the ring at the last floor before you die.

Time:
We want to express that some things happen automatically as a result of time moving forward, such as
the user getting hungrier, or healing automatically. That is, we need to model continuous effects.
How should we model this? How about:

* At the end of each entity's turn, that entity experiences a "time update" and all the effects of time
from the end of the previous turn to the end of this one get batched together.

The unintuitive thing to remember here is that we must imagine that all the entities are moving at the
same time. If there are more entities, then there are more turns happening in one iteration, but the
same amount of time passes in one iteration.

* How to describe continuous effects?

e.g.

```ts
{
    type: "uses-nutrients",
    nutrientsPerSecond: 0.001,
}
```

and then:

```ts
processEffects(e: Entity, time = 1) {
    for (e.effects) { // different entity *types* have different default effects
        if (effect.type === "uses-nutrients") {
            e.satiation -= time * effect.nutrientsPerSecond
        }
    }
}
```
