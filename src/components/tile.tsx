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
        return React.cloneElement(baseTile, {
            className: classnames(baseTile.props.className, visibilityClass),
            onClick: this.handleTileClick,
        });
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
