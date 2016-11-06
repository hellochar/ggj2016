
import * as classnames from "classnames";
import * as React from "react";

import { IUser } from "../model";

export class PureEntityInfo extends React.Component<{entity: IUser, floor: number}, {}> {
    public render() {
        const { entity } = this.props;
        const healthPercentage = entity.health / entity.maxHealth;
        const healthIndicatorClassnames = classnames("rg-entity-info-health", {
            "good": healthPercentage >= 0.7,
            "ok": healthPercentage < 0.7 && healthPercentage >= 0.2,
            "bad": healthPercentage <= 0.2
        });
        return (
            <div className="rg-entity-info">
                <div>
                    <span className="rg-entity-info-name">{entity.name}</span>
                    <span className={healthIndicatorClassnames}>{entity.health} / {entity.maxHealth}</span>
                    <span className="rg-entity-info-floor">floor {this.props.floor + 1}</span>
                </div>
                <div>
                    {
                        entity.inventory.itemIds.map((itemId) => {
                            return (
                                <span className="rg-entity-info-item">{itemId}</span>
                            );
                        })
                    }
                    <span className="rg-entity-info-floor">{entity.inventory.itemIds.length} / {entity.inventory.maxSize}</span>
                </div>
            </div>
        );
    }
}
