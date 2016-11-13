import * as classnames from "classnames";
import * as React from "react";
import * as Bootstrap from "react-bootstrap";

import { isItem, isActor, Entity } from "model/";

/**
 * Add per-entity classnames.
 */
function getIconClassForEntity(entity: Entity) {
    switch (entity.type) {
        case "user": return "fa-user";
        case "mercury": return "fa-mercury";
        case "ring": return "fa-circle-o-notch";
        case "tree": return "fa-tree";
        case "fruit": return "fa-apple";
        case "house": return "fa-home";
    }
}

function nameForEntity(entity: Entity) {
    switch (entity.type) {
        case "user": return entity.name;
        default: return _.capitalize(entity.type);
    }
}

function descriptionForEntity(entity: Entity) {
    switch (entity.type) {
        case "user": return "An aspiring adventurer.";
        case "mercury": return "A cave-dweller, not so different from you and I.";
        case "ring": return "The fabled Ring of Norsogoth. Who knows what would happen when it's worn?";
        case "tree": return "Sorrow is knowledge, those that know the most must mourn the deepest, the tree of knowledge is not the tree of life.";
        case "fruit": return "The roots of education are bitter, but the fruit is sweet.";
        case "house": return "Have nothing in your house that you do not know to be useful, or believe to be beautiful.";
    }
}

export interface IEntityProps {
    entity: Entity;
}

export function EntityComponent({ entity }: IEntityProps) {
    const style = {
        left: entity.position.x * 25,
        top: entity.position.y * 25
    };
    const className = classnames(
        "fa",
        getIconClassForEntity(entity),
        "rg-entity",
        {
            "rg-entity-item": isItem(entity),
            "rg-entity-user": entity.type === "user",
            "rg-entity-actor": isActor(entity),
        }
    );
    const entityElement = <i style={style} className={className} />;

    const popover = (
        <Bootstrap.Popover title={nameForEntity(entity)}>
            <div className="rg-entity-popover-description">
                {descriptionForEntity(entity)}
            </div>
        </Bootstrap.Popover>
    );

    return (
        <Bootstrap.OverlayTrigger delayShow={200} placement="top" overlay={popover}>
            { entityElement }
        </Bootstrap.OverlayTrigger>
    );
}
