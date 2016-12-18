import * as classnames from "classnames";
import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import * as Redux from "redux";

import { EntityComponent } from "components/entity";
import { IUser, IUseItemAction, Item } from "model/";
import { IState } from "state";
import { userPerformAction, findEntityLevel } from "action";

import "./headsUpDisplay.less";

interface IPureHeadsUpDisplayProps {
    dispatch: Redux.Dispatch<IState>;
    user: IUser;
    userItems: Item[];
    userFloor: number;
}

export class PureHeadsUpDisplay extends React.PureComponent<IPureHeadsUpDisplayProps, {}> {
    public handleItemDoubleClick(itemId: string) {
        const action: IUseItemAction = {
            itemId,
            type: "use-item",
        };
        this.props.dispatch(userPerformAction(action));
    }

    public render() {
        const { user: entity } = this.props;
        const healthPercentage = entity.health / entity.maxHealth;
        const healthIndicatorClassnames = classnames("rg-hud-health", {
            "good": healthPercentage >= 0.7,
            "ok": healthPercentage < 0.7 && healthPercentage >= 0.2,
            "bad": healthPercentage <= 0.2
        });

        return (
            <div className="rg-hud">
                <div>
                    <span className="rg-hud-name">{entity.name}</span>
                    <span className={healthIndicatorClassnames}>{entity.health} / {entity.maxHealth}</span>
                    <span className="rg-hud-hunger">fullness: {entity.satiation}</span>
                    <span className="rg-hud-floor">floor {this.props.userFloor + 1}</span>
                </div>
                { this.renderInventory() }
            </div>
        );
    }

    private renderInventory() {
        const { user } = this.props;
        return (
            <div className="rg-hud-inventory">
                {
                    _.range(0, user.inventory.maxSize).map((index) =>
                        this.maybeRenderItem(index)
                    )
                }
            </div>
        );
    }

    private maybeRenderItem(index: number) {
        const item = this.props.userItems[index];
        const itemElement = (item === undefined)
            ? null
            : <EntityComponent
                entity={item}
                onDoubleClick={() => this.handleItemDoubleClick(item.id)}
                usePosition={false} />;

        const className = classnames("rg-hud-item", {
            "rg-hud-item-empty": item === undefined
        });

        return <div key={index} className={className}>
            { itemElement }
        </div>;
    }
}

// given the state, return the user's Item Entities.
function getUserItemsFromState(state: IState) {
    return state.entities["0"].inventory.itemIds.map((itemId) => {
        return state.entities[itemId] as Item;
    });
}

// cache getUserItemsFromState to only return a different object reference from the previous call
// if evaluation of this instance doesn't shallow equal the previous one
const cachedGetUserItemsFromState = (() => {
    let previousValue: Item[];
    return (state: IState) => {
        const value = getUserItemsFromState(state);
        if (previousValue === undefined) {
            previousValue = value;
            return value;
        } else {
            // compare previous to current
            let shouldUpdate: boolean;
            if (value.length !== previousValue.length) {
                shouldUpdate = true;
            } else {
                // shallow compare array elements
                shouldUpdate = previousValue.some((item, index) => { return item !== value[index]; });
            }

            if (shouldUpdate) {
                previousValue = value;
            }
            return value;
        }
    };
})();

function mapStateToProps(state: IState) {
    const userLevel = findEntityLevel("0", state);
    const userFloor = state.levelOrder.indexOf(userLevel.id);
    return {
        user: state.entities["0"],
        userItems: cachedGetUserItemsFromState(state),
        userFloor,
    };
}

export const HeadsUpDisplay = connect(
    mapStateToProps,
    (dispatch: Redux.Dispatch<IState>) => { return { dispatch }; }
)(PureHeadsUpDisplay);
