import * as ReactDOM from "react-dom";
import * as React from "react";
import { AppContainer } from "react-hot-loader";

import "./index.less";
import WizardMain from "./main";

const root = document.createElement("div");
root.id = "wizard";
document.body.appendChild(root);

function render() {
    ReactDOM.render(
        <AppContainer>
            <WizardMain />
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
