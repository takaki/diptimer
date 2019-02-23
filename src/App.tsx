import React, { Component } from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import "./App.css";
import GameTimer from "./containers/GameTimer";
import { DataStore } from "./models/DataStore";
import { modelReducer } from "./reducers";

// @ts-ignore
const store = createStore<DataStore>(modelReducer, new DataStore());

// tslint:disable-next-line
export default class App extends Component {
    public render() {
        return (
            <Provider store={store}>
                <GameTimer/>
            </Provider>);
    }
}
