/// <reference path="../typings/tsd.d.ts" />

import * as ReactDOM from "react-dom";
import * as React from "react";
import { Provider } from "react-redux";
import * as Redux from "redux";
import * as createLogger from "redux-logger";
import thunk from "redux-thunk";

import { Main } from "components/main";
import reducer from "reducer";
import { buildInitialState } from "initialState";

import "./index.less";

const logger = createLogger({ duration: true, timestamp: true, collapsed: () => true });
const store = Redux.createStore(reducer, buildInitialState(), Redux.applyMiddleware(thunk, logger));

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);

ReactDOM.render(
    <Provider store={store}>
        <Main />
    </Provider>, root);
