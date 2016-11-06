/// <reference path="../typings/tsd.d.ts" />

import * as ReactDOM from "react-dom";
import * as React from "react";
import * as Redux from "redux";
import { Provider } from "react-redux";

import { Game } from "components/game";
import reducer from "reducer";

import "./index.less";

const store = Redux.createStore(reducer);

ReactDOM.render(
    <Provider store={store}>
        <Game />
    </Provider>, document.getElementById("root"));
