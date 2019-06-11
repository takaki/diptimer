import { IDataStore } from "./models/DataStore";
import { StopWatch } from "./models/StopWatch";

export interface IGameTimerProps {
  dataStore: IDataStore;
  setRemainTime: (s: string) => void;
  execPause: () => void;
  execGo: () => void;
  setMenuIndex: (i: number) => void;
  setFinish: () => void;
  setNextTimer: () => void;
  newStopWatch: (f: (i: StopWatch) => void, g: (i: StopWatch) => void) => void;
}
