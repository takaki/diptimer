import { createMuiTheme } from "@material-ui/core";
import { MuiThemeProvider } from "@material-ui/core/styles";
import * as React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import "./App.css";
import { GameTimerApp } from "./containers/GameTimerApp";
import { defaultDataStore, IDataStore } from "./models/DataStore";
import { modelReducer } from "./reducers";

const store = createStore<IDataStore, any, any, any>(
  modelReducer,
  defaultDataStore
);
const theme = createMuiTheme({});

export default class App extends React.Component {
  public render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <GameTimerApp />
        </Provider>
      </MuiThemeProvider>
    );
  }
}
