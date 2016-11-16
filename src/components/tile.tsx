import * as classnames from "classnames";
import * as React from "react";

import { ITile, TileType } from "model/";

function iconClassForTile(tile: TileType) {
    switch (tile) {
        case TileType.SPACE: return "fa-square-o rg-tile-space";
        case TileType.WALL: return "fa-stop";
        case TileType.DOWNSTAIRS: return "fa-chevron-down";
        case TileType.UPSTAIRS: return "fa-chevron-up";
        case TileType.DECORATIVE_SPACE: return "fa-slack rg-tile-space";
    }
}

export interface ITileProps {
    tile: ITile;
    key: string;
}

export function Tile({tile}: ITileProps) {
    let visibilityClasses: string;
    if (tile.visible) {
        visibilityClasses = `tile-visible ${iconClassForTile(tile.type)}`;
    } else if (tile.explored) {
        visibilityClasses = `tile-remembered ${iconClassForTile(tile.type)}`;
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
