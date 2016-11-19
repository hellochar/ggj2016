import { IUpdateEntityAction } from "./simpleUpdaters";
import { IAction } from "action";
import { Entity } from "model/entity";
import { Level } from "model/level";
import { Screen } from "state";

export type SimpleUpdaterAction =
IUpdateEntityAction |
IUpdateLevelAction |
ISetScreenAction |
IRotateTurnOrderAction;

export interface IUpdateEntityAction {
    entity: Entity;
    type: "UpdateEntity";
}

export function updateEntity(entity: Entity): IUpdateEntityAction {
    return { entity, type: "UpdateEntity" };
}

export interface IUpdateLevelAction {
    level: Level;
    type: "UpdateLevel";
}

export function updateLevel(level: Level): IUpdateLevelAction {
    return { level, type: "UpdateLevel" };
}

export interface ISetScreenAction {
    screen: Screen;
    type: "SetScreen";
}

export function setScreen(screen: Screen): ISetScreenAction {
    return { screen, type: "SetScreen" };
}

export interface IRotateTurnOrderAction {
    type: "RotateTurnOrder";
}

export function rotateTurnOrder(): IRotateTurnOrderAction {
    return { type: "RotateTurnOrder" };
}

export function isSimpleUpdaterAction(action: IAction): action is SimpleUpdaterAction {
    return action.type === "UpdateEntity"
        || action.type === "UpdateLevel"
        || action.type === "SetScreen"
        || action.type === "RotateTurnOrder";
}