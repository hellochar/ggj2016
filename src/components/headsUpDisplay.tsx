import * as classnames from "classnames";
import * as React from "react";
import { connect } from "react-redux";

import { EntityComponent } from "components/entity";
import { IUser, Level } from "model/";
import { IState } from "state";
import { findEntityLevel } from "action";

interface IPureHeadsUpDisplayProps {
    state: IState;
    user: IUser;
    userLevel: Level;
    userFloor: number;
}

export class PureHeadsUpDisplay extends React.Component<IPureHeadsUpDisplayProps, {}> {
    public render() {
        const { user: entity } = this.props;
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
                    <span className="rg-entity-info-hunger">fullness: {entity.satiation}</span>
                    <span className="rg-entity-info-floor">floor {this.props.userFloor + 1}</span>
                </div>
                <div>
                    {
                        entity.inventory.itemIds.map((itemId) => {
                            return (
                                <div className="rg-entity-info-item">
                                    <EntityComponent
                                        entity={this.props.state.entities[itemId]}
                                        popoverPlacement="bottom"
                                        usePosition={false} />
                                </div>
                            );
                        })
                    }
                    <span className="rg-entity-info-floor">inventory: {entity.inventory.itemIds.length} / {entity.inventory.maxSize}</span>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: IState): IPureHeadsUpDisplayProps {
    const userLevel = findEntityLevel("0", state.levels);
    const userFloor = state.levelOrder.indexOf(userLevel.id);
    return {
        state,
        user: state.entities["0"] as IUser,
        userLevel,
        userFloor,
    };
}

export const HeadsUpDisplay = connect(mapStateToProps)(PureHeadsUpDisplay);
