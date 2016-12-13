import * as classnames from "classnames";
import * as React from "react";

import { CELL_SIZE } from "./commons";
import { ITile, TileType } from "model/";

import "./tile.less";

export interface ITileProps {
    x: number;
    y: number;
    tile: ITile;
    visible: boolean;
    explored: boolean;
}

export class Tile extends React.PureComponent<ITileProps, {}> {
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
        const tileElement = this.getRenderTileElement();
        return React.cloneElement(tileElement, {
            className: classnames(tileElement.props.className, visibilityClass),
        });
    }

    private getRenderTileElement() {
        switch (this.props.tile.type) {
            case TileType.SPACE: return this.renderFontAwesomeIcon("fa-square-o rg-tile-space");
            case TileType.WALL: return this.renderFontAwesomeIcon("fa-stop");
            case TileType.DOWNSTAIRS: return this.renderFontAwesomeIcon("fa-chevron-down");
            case TileType.UPSTAIRS: return this.renderFontAwesomeIcon("fa-chevron-up");
            case TileType.DECORATIVE_SPACE: return this.renderFontAwesomeIcon("fa-slack rg-tile-space");
            case TileType.WATER: return this.renderSimpleTile("rg-tile-water");
            case TileType.GRASS: return this.renderSimpleTile("rg-tile-grass");
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
