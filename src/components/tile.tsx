import { Tooltip, Collapse } from "@blueprintjs/core";
import * as classnames from "classnames";
import * as React from "react";

import { CELL_SIZE } from "./commons";
import { ITile, TileType } from "model/";

import "./tile.less";
import { IPavedFloorTile } from "../model/tile";
import * as _ from "lodash";

export interface ITileProps {
    x: number;
    y: number;
    tile: ITile;
    visible: boolean;
    explored: boolean;
}

export interface ITileState {
    expanded: boolean;
}

export class Tile extends React.PureComponent<ITileProps, ITileState> {
    public state: ITileState = {
        expanded: false,
    };

    private handleTileClick = () => {
        this.setState({expanded: !this.state.expanded});
    };

    public render() {
        const { visible, explored } = this.props;

        if (visible) {
            return this.renderTile("rg-tile-visible");
        } else if (explored) {
            return this.renderTile("rg-tile-remembered");
        } else {
            return null;
        }
    }

    private renderTile(visibilityClass: string) {
        const baseTile = this.getRenderTileElement();
        const tile = React.cloneElement(baseTile, {
            className: classnames(baseTile.props.className, visibilityClass),
            onClick: this.handleTileClick,
        });

        return <Tooltip content={this.getTooltipContent()} tooltipClassName="pt-minimal">
            {tile}
        </Tooltip>;
    }

    private getTooltipContent() {
        return <div>
            <strong>{getNameForTile(this.props.tile)}</strong>
            <Collapse isOpen={this.state.expanded}>
                { this.getExpandedTooltip() }
            </Collapse>
        </div>;
    }

    private getExpandedTooltip() {
        switch (this.props.tile.type) {
            case TileType.DIRT:
                return "Rock particles, minerals, and organic matter that together support life.";
            case TileType.DOWNSTAIRS:
                return <div>
                    <p>An opening in the ground that descends deeper into the Caves.</p>
                    <p>Press E while on this tile to descend a level.</p>
                </div>;
            case TileType.GRASS:
                return "Soft, comfortable plants grow wild over the soil.";
            case TileType.PAVED_FLOOR:
                return "A smoothed and cut slab of stone, laid on the floor. Easy to walk on.";
            case TileType.UPSTAIRS:
                return <div>
                    <p>An outcropping of earth that rises closer to the surface.</p>
                    <p> Press Q while on this tile to ascend a level.</p>
                </div>;
            case TileType.WALL:
                return "A hard, impassable piece of stone.";
            case TileType.WATER:
                return "Water that has made its way into the Caves. It will be cold and sluggish to move through.";
        }
    }

    private getRenderTileElement() {
        const { tile } = this.props;
        switch (tile.type) {
            case TileType.PAVED_FLOOR: return this.renderPavedFloor(tile);
            case TileType.WALL: return this.renderFontAwesomeIcon("fa-stop rg-tile-wall");
            case TileType.DOWNSTAIRS: return this.renderFontAwesomeIcon("fa-chevron-down");
            case TileType.UPSTAIRS: return this.renderFontAwesomeIcon("fa-chevron-up");
            case TileType.WATER: return this.renderSimpleTile("rg-tile-water");
            case TileType.GRASS: return this.renderSimpleTile("rg-tile-grass");
            case TileType.DIRT: return this.renderSimpleTile("rg-tile-dirt");
        }
    }

    private renderPavedFloor(tile: IPavedFloorTile) {
        if (tile.decorative) {
            return this.renderFontAwesomeIcon("fa-slack rg-tile-paved-floor");
        } else {
            return this.renderFontAwesomeIcon("fa-square-o rg-tile-paved-floor");
        }
    }

    private renderSimpleTile(iconClass: string) {
        const className = classnames("rg-tile", iconClass);
        return this.getIElement(className);
    }

    private renderFontAwesomeIcon(iconClass: string) {
        const { tile } = this.props;

        const className = classnames("fa", "rg-tile", iconClass);
        let style: React.CSSProperties = {};
        if (tile.type === TileType.WALL) {
            style.color = tile.color;
        }
        return this.getIElement(className, style);
    }

    private getIElement(className: string, style: React.CSSProperties = {}) {
        style.top = this.props.y * CELL_SIZE;
        style.left = this.props.x * CELL_SIZE;
        return <i className={className} style={style} />;
    }
}

function getNameForTile(tile: ITile) {
    return _.startCase(_.lowerCase(tile.type));
}
