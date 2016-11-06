import * as React from "react";
import { connect } from "react-redux";

import { PureEntityInfo } from "./entityInfo";
import { IUser, Level } from "../model";
import { IState } from "../state";
import { findEntityLevel } from "../action";

interface IPureHeadsUpDisplayProps {
    user: IUser;
    userLevel: Level;
    userFloor: number;
}

export class PureHeadsUpDisplay extends React.Component<IPureHeadsUpDisplayProps, {}> {
    public render() {
        return (
            <div className="rg-hud">
                <PureEntityInfo entity={this.props.user} floor={this.props.userFloor} />
            </div>
        );
    }
}

function mapStateToProps(state: IState): IPureHeadsUpDisplayProps {
    const userLevel = findEntityLevel("0", state.levels);
    const userFloor = state.levelOrder.indexOf(userLevel.id);
    return {
        user: state.entities["0"] as IUser,
        userLevel,
        userFloor,
    };
}

export const HeadsUpDisplay = connect(mapStateToProps)(PureHeadsUpDisplay);
