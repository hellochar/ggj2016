import * as Perf from "react-addons-perf";
import * as ReactDOM from "react-dom";
import * as React from "react";
import { Provider } from "react-redux";
import * as Redux from "redux";
import * as createLogger from "redux-logger";
import thunk from "redux-thunk";

import { Main } from "components/main";
import reducer from "reducer";
import { IState } from "state";
import { buildInitialState } from "initialState";

import "./index.less";

(window as any).Perf = Perf;

const logger = createLogger({ duration: true, timestamp: true, collapsed: () => true });
const store = Redux.createStore<IState>(reducer as Redux.Reducer<IState>, buildInitialState(), Redux.applyMiddleware(thunk, logger));

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);

ReactDOM.render(
    <Provider store={store}>
        <Main />
    </Provider>, root);
