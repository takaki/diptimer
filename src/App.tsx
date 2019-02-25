import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import React, { Component } from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import "./App.css";
import GameTimerApp from "./containers/GameTimerApp";
import { DataStore } from "./models/DataStore";
import { modelReducer } from "./reducers";

// @ts-ignore
const store = createStore<DataStore>(modelReducer, new DataStore());
const theme = createMuiTheme({
    typography: {
        useNextVariants: true,
    },
});

export default class App extends Component {
    public render() {
        return (
            <MuiThemeProvider theme={theme}>
                <Provider store={store}>
                    <GameTimerApp/>
                </Provider>
            </MuiThemeProvider>);
    }
}
