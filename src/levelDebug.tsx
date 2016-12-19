import * as ReactDOM from "react-dom";
import * as React from "react";
import { AppContainer } from "react-hot-loader";
import * as _ from "lodash";

import { COLOR_THEMES } from "colorThemes";
import { PureMap } from "components/map";
import { generateCaveStructure, GENERATION_ALGORITHMS } from "modelGenerators/map/cave";
import { Map } from "model/map";
import { fillInMap } from "./modelGenerators/map/index";

import "./index.less";

const root = document.createElement("div");
root.id = "level-debug";
document.body.appendChild(root);

const mapSample = _.transform(GENERATION_ALGORITHMS, (allAlgorithmSamples, algorithm, name) => {
    const map = generateCaveStructure(60, 30, COLOR_THEMES.DARK_GRAY, algorithm());

    fillInMap(map, {x: _.random(3, map.width - 4), y: _.random(3, map.height - 4)});
    allAlgorithmSamples[name!] = map;
    return allAlgorithmSamples;
}, {} as { [name: string]: Map });

class MapDebugger extends React.Component<{ map: Map, name: string }, {}> {
    public render() {
        const {map, name} = this.props;
        return (
            <div style={ {} }>
                <h1 style={ {color: "white" } }>{name}</h1>
                <PureMap map={map} />
            </div>
        );
    }
}

function render() {
    ReactDOM.render(
        <AppContainer>
            <div className="no-animation" style={ { overflow: "auto", width: "100%", height: "100%" } } >
                {
                    _.map(mapSample, (map, name) => {
                        return <MapDebugger key={name} map={map} name={name!} />;
                    })
                }
            </div>
        </AppContainer>
    , root);
}

render();

// declare var module: any;
// declare var require: any;

// if (module.hot) {
//     module.hot.accept();

//     module.hot.dispose(() => {
//         // remove whatever this module had previously done
//     });
// }
