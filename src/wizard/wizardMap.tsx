import * as React from "react";

import { PureMap } from "components/map";
import { Map } from "model/map";
import { CELL_SIZE } from "../components/commons";

export interface IWizardMapProps {
    map: Map;
    name: number | string;
}

export default class WizardMap extends React.Component<IWizardMapProps, {}> {
    public render() {
        const {map, name} = this.props;
        return (
        <div className="rg-wizard-map" style={ { height: map.height * CELL_SIZE / 2 + 50 } }>
                <h1 className="rg-wizard-map-title">{name}</h1>
                <PureMap map={map} />
            </div>
        );
    }
}
