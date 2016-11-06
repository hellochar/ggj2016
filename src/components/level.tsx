import * as classnames from "classnames";
import * as React from "react";
import * as Bootstrap from "react-bootstrap";

import { isItem, isActor, Entity, Level, ITile, TileType } from "model/";
import { IPosition } from "math";

export interface ILevelProps {
    getEntity: (id: string) => Entity;
    level: Level;
    center: IPosition;
}

export class PureLevel extends React.Component<ILevelProps, {}> {
    public iconClassForTile(tile: TileType) {
        switch (tile) {
            case TileType.SPACE: return "fa-square-o rg-tile-space";
            case TileType.WALL: return "fa-stop";
            case TileType.DOWNSTAIRS: return "fa-chevron-down";
            case TileType.UPSTAIRS: return "fa-chevron-up";
            case TileType.DECORATIVE_SPACE: return "fa-slack rg-tile-space";
        }
    }

    public elementForTile(tile: ITile, x: number, y: number) {
        let visibilityClasses: string;
        if (tile.visible) {
            visibilityClasses = `tile-visible ${this.iconClassForTile(tile.type)}`;
        } else if (tile.explored) {
            visibilityClasses = `tile-remembered ${this.iconClassForTile(tile.type)}`;
        } else {
            visibilityClasses = "tile-unexplored";
        }
        const className = classnames("fa", "rg-tile", visibilityClasses);
        return <i className={className} key={`${x},${y}`}></i>;
    }

    /**
     * Add per-entity classnames.
     */
    public getIconClassForEntity(entity: Entity) {
        switch (entity.type) {
            case "user": return "fa-user";
            case "mercury": return "fa-mercury";
            case "ring": return "fa-circle-o-notch";
            case "tree": return "fa-tree";
            case "fruit": return "fa-apple";
            case "house": return "fa-home";
        }
    }

    public nameForEntity(entity: Entity) {
        switch (entity.type) {
            case "user": return entity.name;
            default: return _.capitalize(entity.type);
        }
    }

    public descriptionForEntity(entity: Entity) {
        switch (entity.type) {
            case "user": return "An aspiring adventurer.";
            case "mercury": return "A cave-dweller, not so different from you and I.";
            case "ring": return "The fabled Ring of Norsogoth. Who knows what would happen when it's worn?";
            case "tree": return "Sorrow is knowledge, those that know the most must mourn the deepest, the tree of knowledge is not the tree of life.";
            case "fruit": return "The roots of education are bitter, but the fruit is sweet.";
            case "house": return "Have nothing in your house that you do not know to be useful, or believe to be beautiful.";
        }
    }

    public elementForEntity(entity: Entity) {
        const style = {
            left: entity.position.x * 25,
            top: entity.position.y * 25
        };
        const className = classnames(
            "fa",
            this.getIconClassForEntity(entity),
            "rg-entity",
            {
                "rg-entity-item": isItem(entity),
                "rg-entity-user": entity.type === "user",
                "rg-entity-actor": isActor(entity),
            }
        );
        const entityElement = <i
            style={style}
            className={className}
            key={entity.id}>
            </i>;

        const popover = (
            <Bootstrap.Popover title={this.nameForEntity(entity)}>
                <div className="rg-entity-popover-description">
                    {this.descriptionForEntity(entity)}
                </div>
            </Bootstrap.Popover>
        );

        return (
            <Bootstrap.OverlayTrigger delayShow={200} placement="top" overlay={popover}>
                { entityElement }
            </Bootstrap.OverlayTrigger>
        );
    }

    public render() {
        const style = {
            top: `-${this.props.center.y * 25}px`,
            left: `-${this.props.center.x * 25}px`,
        };
        return <div className="rg-map" style={style}>
            {this.props.level.map.getTiles().map((row, y) => {
                return (
                    <div className="rg-row" key={y}>
                        {row.map((tile, x) => this.elementForTile(tile, x, y))}
                    </div>
                );
            })}
            {this.props.level.entities.map((entityId) => {
                const entity = this.props.getEntity(entityId);
                if (this.props.level.isVisible(entity.position)) {
                    return this.elementForEntity(entity);
                } else {
                    return null;
                }
            })}
        </div>;
    }
}
