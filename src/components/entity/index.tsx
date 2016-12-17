import * as classnames from "classnames";
import * as _ from "lodash";
import * as React from "react";
import { Intent, Position, Popover, PopoverInteractionKind, ProgressBar } from "@blueprintjs/core";

import { isItem, isActor, Entity, EntityType, hasHealth } from "model/";
import { CELL_SIZE } from "components/commons";

import "./entity.less";
import descriptionForEntity from "./descriptions";

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

    private getEntityClassnames(entity: Entity): string {
        switch (entity.type) {
            case "user": return "fa-user";
            case "mercury": return "fa-mercury";
            case "ring": return "fa-circle-o-notch";
            case "tree": return "fa-tree";
            case "fruit": return "fa-lemon-o";
            case "house": return "fa-home";
            case "axe": return "fa-gavel";
        }
    }

    public render() {
        const { entity, usePosition = true } = this.props;

        const style = {
            transform: `translate(${entity.position.x * CELL_SIZE}px, ${entity.position.y * CELL_SIZE}px)`,
        };

        const entityElement = this.renderEntityElement();

        if (usePosition) {
            return (
                <div className="rg-positioner" style={style}>
                    { entityElement }
                </div>
            );
        } else {
            return entityElement;
        }
    }

    private renderEntityElement() {
        const { entity, onDoubleClick } = this.props;

        const containerClasses = classnames(
            "rg-entity",
            {
                "rg-entity-item": isItem(entity),
                "rg-entity-user": entity.type === "user",
                "rg-entity-actor": isActor(entity),
            }
        );

        const healthMeter = hasHealth(entity)
            ? <ProgressBar
                className="pt-no-stripes rg-health-meter"
                intent={Intent.SUCCESS}
                value={entity.health / entity.maxHealth} />
            : null;

        const element = <i className={classnames("rg-entity-element", "fa", this.getEntityClassnames(entity))} />;
        return (
            <div className={containerClasses}>
                { healthMeter }
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
    public render() {
        const popoverContent = (
            <div>
                <h3 className="rg-entity-popover-title">
                    {this.props.name}
                </h3>
                <div className="rg-entity-popover-description">
                    {descriptionForEntity(this.props.type)}
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
