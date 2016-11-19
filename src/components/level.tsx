import * as React from "react";

import { Entity, Level } from "model/";
import { IPosition } from "math";
import { Tile } from "components/tile";
import { EntityComponent } from "components/entity";

export interface ILevelProps {
    getEntity: (id: string) => Entity;
    level: Level;
    center: IPosition;
}

export class PureLevel extends React.PureComponent<ILevelProps, {}> {
    public render() {
        // Offset map such that center stays in the center
        const style = {
            top: `-${this.props.center.y * 25}px`,
            left: `-${this.props.center.x * 25}px`,
        };
        return <div className="rg-map" style={style}>
            {this.props.level.map.getTiles().map((row, y) => (
                <div className="rg-row" key={y}>
                    {row.map((tile, x) => <Tile tile={tile} key={`${x},${y}`} />)}
                </div>
            ))}
            {this.props.level.entities.map((entityId) => {
                const entity = this.props.getEntity(entityId);
                if (this.props.level.isVisible(entity.position)) {
                    return <EntityComponent entity={entity} key={entity.id} />;
                } else {
                    return null;
                }
            })}
        </div>;
    }
}
