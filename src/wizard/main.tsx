import * as React from "react";
import * as _ from "lodash";

import { COLOR_THEMES } from "colorThemes";
import { generateCaveStructure, GENERATION_ALGORITHMS } from "modelGenerators/map/cave";
import { Map } from "model/map";
import { fillInMap } from "modelGenerators/map/index";
import WizardMap from "./wizardMap";

export interface IWizardMainState {
    mapSamples: {
        [name: string]: Map;
    } | Map[];
    value: string | undefined;
}

export default class WizardMain extends React.Component<{}, IWizardMainState> {
    constructor(props: {}, context: any) {
        super(props, context);
        this.state = {
            mapSamples: this.getNewMapSamples(undefined),
            value: undefined,
        };
    }

    private getNewMapSamples(value: string | undefined) {
        if (value == null || value === "--All--") {
            const mapSamples = _.transform(GENERATION_ALGORITHMS, (allAlgorithmSamples, algorithm, name) => {
                const map = generateCaveStructure(60, 30, COLOR_THEMES.DARK_GRAY, algorithm());

                fillInMap(map, {x: _.random(3, map.width - 4), y: _.random(3, map.height - 4)});
                allAlgorithmSamples[name!] = map;
                return allAlgorithmSamples;
            }, {} as { [name: string]: Map });
            return mapSamples;
        } else {
            const mapSamples = _.range(0, 5).map((index) => {
                const map = generateCaveStructure(60, 30, COLOR_THEMES.DARK_GRAY, GENERATION_ALGORITHMS[value]());

                fillInMap(map, {x: _.random(3, map.width - 4), y: _.random(3, map.height - 4)});
                return map;
            });
            return mapSamples;
        }
    }

    public render() {
        return (
            <div className="no-animation" style={ { overflow: "auto", width: "100%", height: "100%" } } >
                { this.renderNavbar() }
                <div className="rg-wizard-map-samples">
                    {
                        _.map(this.state.mapSamples, (map, name) => {
                            return <WizardMap key={name} map={map} name={name!} />;
                        })
                    }
                </div>
            </div>
        );
    }

    public renderNavbar() {
        return (
            <nav className="pt-navbar">
                <div className="pt-navbar-group pt-align-left">
                    <div className="pt-navbar-heading">Wizard Mode</div>
                    <div className="pt-select">
                        <select defaultValue={undefined} onChange={this.handleSelectChange}>
                            <option>--All--</option>
                            {
                                _.map(GENERATION_ALGORITHMS, (algo, name) => {
                                    return <option key={name}>{name}</option>;
                                })
                            }
                        </select>
                    </div>
                    <button className="pt-button" onClick={this.handleButtonClick}>Regenerate</button>
                </div>
                <div className="pt-navbar-group pt-align-right">
                </div>
            </nav>
        );
    }

    private handleSelectChange = (event: React.FormEvent<HTMLSelectElement>) => {
        this.setState({
            mapSamples: this.getNewMapSamples(event.currentTarget.value),
            value: event.currentTarget.value,
        });
    };

    private handleButtonClick = () => {
        this.setState({
            mapSamples: this.getNewMapSamples(this.state.value),
            value: this.state.value,
        });
    }
}