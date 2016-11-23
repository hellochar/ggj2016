import * as classnames from "classnames";
import * as _ from "lodash";
import * as React from "react";
import { Position, Popover, PopoverInteractionKind } from "@blueprintjs/core";

import { isItem, isActor, Entity, EntityType } from "model/";

export interface IEntityProps {
    entity: Entity;
    usePosition?: boolean;
    onDoubleClick?: () => void;
}

export class EntityComponent extends React.PureComponent<IEntityProps, {}> {
    private nameForEntity(entity: Entity) {
        switch (entity.type) {
            case "user": return entity.name;
            default: return _.capitalize(entity.type);
        }
    }

    private renderEntityElement(entity: Entity): string | JSX.Element {
        switch (entity.type) {
            case "user": return "fa-user";
            case "mercury": return "fa-mercury";
            case "ring": return "fa-circle-o-notch";
            case "tree": return "fa-tree";
            case "fruit": return "fa-lemon-o";
            case "house": return "fa-home";
            case "axe": return <span>G</span>;
        }
    }

    public render() {
        const { entity, usePosition = true, onDoubleClick } = this.props;
        const entityElement = this.renderEntityElement(entity);
        let element: JSX.Element;
        if (typeof entityElement === "string") {
            const className = classnames(
                "fa",
                entityElement,
            );
            element = <i className={className} />;
        } else {
            element = entityElement;
        }

        const style = usePosition ? {
                left: entity.position.x * 25,
                top: entity.position.y * 25,
                position: "absolute",
            } : {};

        const fooClasses = classnames(
            "rg-entity",
            {
                "rg-entity-item": isItem(entity),
                "rg-entity-user": entity.type === "user",
                "rg-entity-actor": isActor(entity),
            }
        );

        return (
            <div style={style} className={fooClasses}>
                { element }
                <EntityPopover name={this.nameForEntity(entity)} onDoubleClick={onDoubleClick} type={entity.type} />
            </div>
        );
    }
}

interface IEntityPopoverProps {
    name: string;
    type: EntityType;
    onDoubleClick?: () => void;
}

/**
 * Component for the Popover of an Entity. Refactored into a PureComponent to minimize updates, since Blueprint Popovers
 * force synchronous layout in their DOM update callback, which can add upwards of 30ms delay to an action.
 */
class EntityPopover extends React.PureComponent<IEntityPopoverProps, {}> {
    private descriptionForEntity(type: EntityType) {
        switch (type) {
            case "user": return "An aspiring adventurer.";
            case "mercury": return "A cave-dweller, not so different from you and I.";
            case "ring": return "The fabled Ring of Norsogoth. Who knows what would happen when it's worn?";
            case "tree":
                return "Sorrow is knowledge, those that know the most must mourn the deepest, the tree of knowledge is not the tree of life.";
            case "fruit": return "The roots of education are bitter, but the fruit is sweet.";
            case "house": return "Have nothing in your house that you do not know to be useful, or believe to be beautiful.";
            case "axe": return "Your trusty axe! Cuts down trees with ease.";
        }
    }

    public render() {
        const popoverContent = (
            <div>
                <h3 className="rg-entity-popover-title">
                    {this.props.name}
                </h3>
                <div className="rg-entity-popover-description">
                    {this.descriptionForEntity(this.props.type)}
                </div>
            </div>
        );

        return <Popover className="rg-entity-popover"
                        content={popoverContent}
                        popoverClassName="pt-popover-content-sizing"
                        interactionKind={PopoverInteractionKind.HOVER}
                        hoverCloseDelay={0}
                        hoverOpenDelay={200}
                        position={Position.TOP_LEFT}
                        useSmartPositioning={true}>
                <div className="rg-entity-popover-target" onDoubleClick={this.props.onDoubleClick}></div>
            </Popover>;
    }
}
