import "react-hot-loader/patch";

import * as _ from "lodash";
import * as Perf from "react-addons-perf";
import * as ReactDOM from "react-dom";
import * as React from "react";
import { AppContainer } from "react-hot-loader";
import { Provider } from "react-redux";
import * as Redux from "redux";
import { batchedSubscribe } from "redux-batched-subscribe";
import * as createLogger from "redux-logger";
import thunk from "redux-thunk";

import { Main } from "components/main";
import reducer from "reducer";
import { IState } from "state";
import { buildInitialState } from "initialState";

import "./index.less";

(window as any).Perf = Perf;

const logger = createLogger({ duration: true, timestamp: true, collapsed: () => true });
const storeEnhancer: Redux.GenericStoreEnhancer = Redux.compose(
    Redux.applyMiddleware(
        thunk,
        logger
    ),
    batchedSubscribe(_.debounce((notify: any) => notify()))
);
const store = Redux.createStore<IState>(reducer as Redux.Reducer<IState>, buildInitialState(), storeEnhancer);

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);

ReactDOM.render(
    <AppContainer>
        <Provider store={store}>
            <Main />
        </Provider>
    </AppContainer>,
    root
);

declare var module: any;
declare var require: any;

if (module.hot) {
    module.hot.accept("components/main", () => {
        const NextMain = require("components/main").Main;
        ReactDOM.render(
            <AppContainer>
                <Provider store={store}>
                    <NextMain />
                </Provider>
            </AppContainer>,
            root
        );
    });
}
