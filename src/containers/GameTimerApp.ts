import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
  execGo,
  execPause,
  ModelAction,
  newStopWatch,
  setFinish,
  setMenuIndex,
  setNextTimer,
  setRemainTime,
  setStopWatch
} from "../actions";
import { GameTimer } from "../components/GameTimer";
import { IDataStore } from "../models/DataStore";
import { StopWatch } from "../models/StopWatch";

export const mapStateToProps = (dataStore: IDataStore) => ({ dataStore });

export const mapDispatchToProps = (dispatch: Dispatch<ModelAction>) => ({
  setRemainTime: (s: string) => dispatch(setRemainTime(s)),
  execPause: () => dispatch(execPause()),
  execGo: () => dispatch(execGo()),
  setMenuIndex: (i: number) => dispatch(setMenuIndex(i)),
  setFinish: () => dispatch(setFinish()),
  setNextTimer: () => dispatch(setNextTimer()),
  newStopWatch: (f: (i: StopWatch) => void, g: (i: StopWatch) => void) =>
    dispatch(newStopWatch(f, g)),
  setStopWatch: (stopWatch: StopWatch) => dispatch(setStopWatch(stopWatch))
});

export const GameTimerApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(GameTimer);
