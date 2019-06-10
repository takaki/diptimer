import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
  execGo,
  execPause,
  ModelAction,
  setFinish,
  setMenuIndex,
  setNextTimer,
  setRemainTime
} from "../actions";
import { GameTimer } from "../components/GameTimer";
import { IDataStore } from "../models/DataStore";

export function mapStateToProps(dataStore: IDataStore) {
  return { dataStore };
}

export function mapDispatchToProps(dispatch: Dispatch<ModelAction>) {
  return {
    setRemainTime: (s: string) => dispatch(setRemainTime(s)),
    execPause: () => dispatch(execPause()),
    execGo: () => dispatch(execGo()),
    setMenuIndex: (i: number) => dispatch(setMenuIndex(i)),
    setFinish: () => dispatch(setFinish()),
    setNextTimer: () => dispatch(setNextTimer())
  };
}

export const GameTimerApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(GameTimer);
