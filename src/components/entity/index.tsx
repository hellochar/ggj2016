import * as classnames from "classnames";
import * as _ from "lodash";
import * as React from "react";
import { Intent, ProgressBar } from "@blueprintjs/core";

import { isItem, isActor, Entity, hasHealth } from "model/";
import { CELL_SIZE } from "components/commons";

import "./entity.less";

export interface IEntityProps {
    entity: Entity;
    usePosition?: boolean;
    onDoubleClick?: () => void;
}

export class EntityComponent extends React.PureComponent<IEntityProps, {}> {
    public nameForEntity(entity: Entity) {
        switch (entity.type) {
            case "user": return entity.name;
            default: return _.capitalize(entity.type);
        }
    }

    private getEntityClassnames(entity: Entity): string {
        switch (entity.type) {
            case "user": return "fa fa-user";
            case "mercury": return "fa fa-mercury";
            case "ring": return "fa fa-circle-o-notch";
            case "tree": return "fa fa-tree";
            case "fruit": return "fa fa-lemon-o";
            case "house": return "fa fa-home";
            case "axe": return "fa fa-gavel";
            case "pickaxe": return "rg-entity-pickaxe";
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

        const element = <i className={classnames("rg-entity-element", this.getEntityClassnames(entity))} />;
        return (
            <div className={containerClasses} onDoubleClick={onDoubleClick}>
                { healthMeter }
                { element }
            </div>
        );
    }
}
