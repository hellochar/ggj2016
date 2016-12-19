import * as React from "react";

import { Entity, Level } from "model/";
import { IPosition } from "math";
import { CELL_SIZE } from "components/commons";
import { EntityComponent } from "components/entity";

import "./level.less";
import { PureMap } from "./map";

export interface ILevelProps {
    level: Level;
    levelEntities: Entity[];
    center: IPosition;
}

export class PureLevel extends React.PureComponent<ILevelProps, {}> {
    public render() {
        return (
            <div className="rg-level-positioner">
                { this.renderLevel() }
            </div>
        );
    }

    private renderLevel() {
        const { level, levelEntities, center } = this.props;
        // Offset map such that center stays in the center
        const style = {
            transform: `translate(-${center.x * CELL_SIZE}px, -${center.y * CELL_SIZE}px)`
        };
        return <div className="rg-level" style={style}>
            <PureMap map={level.map} visibility={level.visibility} />
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
