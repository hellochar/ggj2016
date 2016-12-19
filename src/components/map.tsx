import * as React from "react";

import { Map } from "model/map";
import { Tile } from "./tile";
import { IVisibilityInfo } from "../model/level";
import { CELL_SIZE } from "components/commons";

import "./map.less";

export interface IMapProps {
    map: Map;
    visibility?: IVisibilityInfo[][];
}

export class PureMap extends React.PureComponent<IMapProps, {}> {
    private static ALWAYS_VISIBLE: IVisibilityInfo = {
        explored: true,
        visible: true
    };

    private getVisibilityInfo(x: number, y: number) {
        return this.props.visibility === undefined
            ? PureMap.ALWAYS_VISIBLE
            : this.props.visibility[y][x];
    }

    public render() {
        const { map } = this.props;

        return (
            <div className="rg-map" style={ { width: map.width * CELL_SIZE, height: map.height * CELL_SIZE, position: "relative" } }>
                {map.getTiles().map((row, y) => (
                    <div className="rg-map-row" key={y}>
                        {
                            row.map((tile, x) => {
                                const visibility = this.getVisibilityInfo(x, y);
                                return (
                                    <Tile
                                        key={`${x},${y}`}
                                        tile={tile}
                                        explored={visibility.explored}
                                        visible={visibility.visible}
                                        x={x}
                                        y={y}
                                    />
                                );
                            })
                        }
                    </div>
                ))}
            </div>
        );
    }
}
