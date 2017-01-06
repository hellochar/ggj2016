
import { Hotkey, Hotkeys, HotkeysTarget, Collapse } from "@blueprintjs/core";
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

interface IPureHeadsUpDisplayState {
    inventoryOpen: boolean;
}

@HotkeysTarget
export class PureHeadsUpDisplay extends React.PureComponent<IPureHeadsUpDisplayProps, IPureHeadsUpDisplayState> {
    public state: IPureHeadsUpDisplayState = {
        inventoryOpen: false,
    };

    public handleItemDoubleClick(itemId: string) {
        const action: IUseItemAction = {
            itemId,
            type: "use-item",
        };
        this.props.dispatch(userPerformAction(action));
    }

    public render() {
        const { user } = this.props;
        const healthPercentage = user.health / user.maxHealth;
        const healthIndicatorClassnames = classnames("rg-hud-health", {
            "good": healthPercentage >= 0.7,
            "ok": healthPercentage < 0.7 && healthPercentage >= 0.2,
            "bad": healthPercentage <= 0.2
        });

        return (
            <div className="rg-hud">
                <div className="rg-hud-status-bar">
                    <div className="rg-hud-name">{user.name}</div>
                    <span className={healthIndicatorClassnames}>HP: {user.health} / {user.maxHealth}</span>
                    <span className="rg-hud-satiation">fullness: {_.round(user.satiation * 100)}%</span>
                    <span className="rg-hud-temperature">Warmth: {user.temperature} &deg;C</span>
                    <span className="rg-hud-energy">Energy: {_.round(user.energy * 100)}%</span>
                    <span className="rg-hud-floor">Caves, {(this.props.userFloor + 1) * 20} feet down</span>
                </div>
                { this.maybeRenderInventory() }
            </div>
        );
    }

    private maybeRenderInventory() {
        const { user } = this.props;
        return (
            <Collapse isOpen={this.state.inventoryOpen}>
                <div className="rg-hud-inventory">
                    {
                        _.range(0, user.inventory.maxSize).map((index) =>
                            this.maybeRenderItem(index)
                        )
                    }
                </div>
            </Collapse>
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

    public renderHotkeys() {
        return <Hotkeys>
            <Hotkey
                combo="i"
                global
                label="Toggle Inventory"
                onKeyDown={ this.handleIKeyPressed }
            />
        </Hotkeys>;
    }

    private handleIKeyPressed = () => {
        this.setState({
            inventoryOpen: !this.state.inventoryOpen
        });
    };
}

// given the state, return the user's Item Entities.
function getUserItemsFromState(state: IState) {
    return state.entities["0"].inventory.itemIds.map((itemId) => {
        return state.entities[itemId] as Item;
    });
}

// cache getUserItemsFromState to only return a different object reference from the previous call
// if evaluation of this instance doesn't shallow equal the previous one. This avoid unnecessary
// renders of the HeadsUpDisplay component.
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
