import { IEntityUpdateAction } from "./simpleUpdaters";
import { IAction } from "action";
import { Entity } from "model/entity";
import { Level } from "model/level";
import { Screen } from "state";

export type SimpleUpdaterAction =
IEntityUpdateAction |
IEntityDeleteAction |
IUpdateLevelAction |
ISetScreenAction |
IRotateTurnOrderAction;

export interface IEntityUpdateAction {
    entity: Entity;
    type: "EntityUpdate";
}

export interface IEntityDeleteAction {
    entityId: string;
    type: "EntityDelete";
}

export function entityUpdate(entity: Entity): IEntityUpdateAction {
    return { entity, type: "EntityUpdate" };
}

export function entityDelete(entityId: string): IEntityDeleteAction {
    return { entityId, type: "EntityDelete" };
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
    return action.type === "EntityUpdate"
        || action.type === "EntityDelete"
        || action.type === "UpdateLevel"
        || action.type === "SetScreen"
        || action.type === "RotateTurnOrder";
}