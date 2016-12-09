import * as React from "react";

import { Entity, Level } from "model/";
import { IPosition } from "math";
import { CELL_SIZE } from "components/commons";
import { Tile } from "components/tile";
import { EntityComponent } from "components/entity";

export interface ILevelProps {
    level: Level;
    levelEntities: Entity[];
    center: IPosition;
}

export class PureLevel extends React.PureComponent<ILevelProps, {}> {
    public render() {
        return (
            <div className="rg-map-positioner">
                { this.renderMap() }
            </div>
        );
    }

    private renderMap() {
        const { level, levelEntities, center } = this.props;
        // Offset map such that center stays in the center
        const style = {
            transform: `translate(-${center.x * CELL_SIZE}px, -${center.y * CELL_SIZE}px)`
        };
        return <div className="rg-map" style={style}>
            {level.map.getTiles().map((row, y) => (
                <div className="rg-row" key={y}>
                    {
                        row.map((tile, x) => {
                            const visibility = level.visibility[y][x];
                            return (
                                <Tile
                                    tile={tile}
                                    key={`${x},${y}`}
                                    explored={visibility.explored}
                                    visible={visibility.visible}
                                />
                            );
                        })
                    }
                </div>
            ))}
            {levelEntities.map((entity) => {
                if (level.isVisible(entity.position)) {
                    return <EntityComponent entity={entity} key={entity.id} />;
                } else {
                    return null;
                }
            })}
        </div>;
    }
}
