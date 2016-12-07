import * as classnames from "classnames";
import * as React from "react";

import { ITile, TileType } from "model/";

export interface ITileProps {
    tile: ITile;
    visible: boolean;
    explored: boolean;
}

export class Tile extends React.PureComponent<ITileProps, {}> {
    private iconClassForTile(tile: TileType) {
        switch (tile) {
            case TileType.SPACE: return "fa-square-o rg-tile-space";
            case TileType.WALL: return "fa-stop";
            case TileType.DOWNSTAIRS: return "fa-chevron-down";
            case TileType.UPSTAIRS: return "fa-chevron-up";
            case TileType.DECORATIVE_SPACE: return "fa-slack rg-tile-space";
            case TileType.WATER: return "fa-tint";
        }
    }

    public render() {
        const { tile, visible, explored } = this.props;

        let visibilityClasses: string;
        if (visible) {
            visibilityClasses = `tile-visible ${this.iconClassForTile(tile.type)}`;
        } else if (explored) {
            visibilityClasses = `tile-remembered ${this.iconClassForTile(tile.type)}`;
        } else {
            visibilityClasses = "tile-unexplored";
        }
        const className = classnames("fa", "rg-tile", visibilityClasses);
        let style: React.CSSProperties = {};
        if (tile.type === TileType.WALL) {
            style.color = tile.color;
        }
        return <i className={className} style={style}></i>;
    }
}
