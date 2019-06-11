import {
  execGo,
  execPause,
  newStopWatch,
  setFinish,
  setMenuIndex,
  setNextTimer,
  setRemainTime,
  setStopWatch
} from "./actions";
import { IDataStore } from "./models/DataStore";

export interface IGameTimerProps {
  dataStore: IDataStore;
  setRemainTime: typeof setRemainTime;
  execPause: typeof execPause;
  execGo: typeof execGo;
  setMenuIndex: typeof setMenuIndex;
  setFinish: typeof setFinish;
  setNextTimer: typeof setNextTimer;
  newStopWatch: typeof newStopWatch;
  setStopWatch: typeof setStopWatch;
}
