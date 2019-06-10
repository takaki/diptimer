import { createMuiTheme } from "@material-ui/core";
import { MuiThemeProvider } from "@material-ui/core/styles";
import * as React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import "./App.css";
import GameTimerApp from "./containers/GameTimerApp";
import { DataStore } from "./models/DataStore";
import { modelReducer } from "./reducers";

const store = createStore<DataStore, any, any, any>(modelReducer, new DataStore());
const theme = createMuiTheme({});

export default class App extends React.Component {
  public render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <GameTimerApp/>
        </Provider>
      </MuiThemeProvider>);
  }
}
